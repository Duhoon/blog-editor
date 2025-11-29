import { createClient, SupabaseClient } from "@supabase/supabase-js";
import axios from 'axios';
import * as dotenv from "dotenv";
import path from 'path';
import { exportFrontmatter } from "./util";
import { Locales, PostInsertDto, PostMetadata } from "@blog-editor/types/Post";
import { TagModel, TagPostLinksModel } from '@blog-editor/types/Category';
import { convertKeysToSnakeCase } from "../utils";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const locales = ["ko", "en-US"];
const categories = ["development", "movie", "book"];

const categoryNameData = {
  "development": {"ko": "개발", "en-US": "development"},
  "movie": {"ko": "영화", "en-US": "movie"},
  "book": {"ko": "책", "en-US": "book"},
} as Record<string, Record<string, string>>;

const prePaths: string[] = []
for (const locale of locales) {
  for (const category of categories) {
    prePaths.push(path.join("posts", locale, category));
  }
}
console.log(`prePaths => ${prePaths}`);

/**
 * 마이그레이션 작업 함수
 */
const migration = async()=>{
  if (!SUPABASE_URL || !SUPABASE_KEY ) return;
  // supabase 클라이언트 연결
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // await migrationCategories(supabase);
    await migrationPosts(supabase);
  }catch (error) {
    console.log(error);
  }
}

/**
 * 카테고리 이관
 */
async function migrationCategories (supabase: SupabaseClient) {
  const categoryEntries = Object.keys(categoryNameData).map(category=>{
    return {
      id: category,
      name: categoryNameData[category],
      description: categoryNameData[category],
    }
  });
  const {error} = await supabase.from("categories").insert(categoryEntries);
  if (error) {
    console.log("카테고리 이관 중 에러 발생");
    console.log(error);
  } else {
    console.log("카테고리 이관 완료");
  }
}

/**
 * 포스트 이관
 */
async function migrationPosts (supabase: SupabaseClient) {
  // 태그 이관 위한 Set 자료형
  const tagMapBucket = new Map<string, TagModel>();
  const {data: tagsInDB} = await supabase.from("tags").select();
  if (tagsInDB && tagsInDB.length > 0){
    tagsInDB.forEach((tag: TagModel) => tagMapBucket.set(tag.name, tag));
  }

  /**
   * 포스트 이관
   */
  // 파일 URL 불러오기
  const fileUrls = await getPostFileUrls(supabase);
  console.log(`fileUrls => ${[fileUrls]}`)

  // 개별 파일 불러와서 메타데이터 추출하기
  const fileTotalCount = fileUrls.length;
  for (const [idx, fileUrl] of fileUrls.entries()) {
    console.log(`process current status: ${idx + 1} / ${fileTotalCount}`);
    const {data: file} = await axios.get(fileUrl);


    const { data : {frontmatter: metadata}} = await exportFrontmatter(file);
    console.log("File Metadata");
    console.log(metadata);

    const {locale, category, slug} = parseLocaleAndSlugFromUrl(fileUrl)

    const post = convertFileToPost(file, {...(metadata as PostMetadata), locale, slug })
    const {error: postInsertError} = await supabase.from("posts")
      .insert( convertKeysToSnakeCase({...post, is_published : true}) )
    if (postInsertError) {
      console.log(`에러: post 이관 중 발생`);
      console.log(postInsertError);
      continue;
    }

    const {error: postFindError, data} = await supabase.from("posts")
      .select()
      .eq("slug", slug);
    
    if (postFindError) {
      console.log(`에러: DB에서 포스트 불러오기 실패`);
      console.log(postFindError);
    }

    if (!data || data.length <= 0) {
      console.log(`에러: DB에서 slug:${slug} 해당하는 포스트 찾기 실패`);
      continue;
    }
    const postInDB = data[0];

    const {error: categoryLinkInsertError} = await supabase
      .from("post_category_links")
      .insert( 
        {
          post_id: postInDB.id,
          category_id: category,
          is_active: true,
        }
      )
    if (categoryLinkInsertError) {
      console.log(`에러: 포스트-카테고리 N:M 맵핑 데이터 추가 실패`);
      console.log(categoryLinkInsertError);
    }

    /**
     * 태그 이관
     */
    const tagTempSet = new Set<string>();
    const tags = (metadata as PostMetadata).tags;
    if (!tags || tags.length <= 0) continue;
    for (const tag of tags) {
      if (!tagMapBucket.has(tag)) {
        tagTempSet.add(tag);
      }
    }

    const {data: tagEntries, error: tagInsertError} = await supabase.from('tags')
          .insert([...tagTempSet].map(tag=> ({name: tag}))).select();
    if(tagInsertError) {
      console.log(`에러: tag 삽입 중 문제 발생`);
      console.log(tagInsertError);
      continue;
    }

    tagEntries.forEach((tagEntry)=>{
      if (!tagMapBucket.has(tagEntry.name)) {
        tagMapBucket.set(tagEntry.name, tagEntry);
      }
    })
    
    const tagPostLinkEntry = tags.map((tag)=>{
      const tagInDB = tagMapBucket.get(tag);
      if (!tagInDB || !tagInDB.id) return;
      return {
        post_id: postInDB.id,
        tag_id: tagInDB.id,
        is_active: true
      }
    })

    const { error: TagPostLinkInsertError } = await supabase.from("tag_post_links").insert(tagPostLinkEntry)
    if ( TagPostLinkInsertError ){
      console.log(`에러: 태그-포스트 맵핑 정보 입력 에러`);
      console.log(TagPostLinkInsertError);
    }
  }
}


async function getPostFileUrls (supabase: SupabaseClient) {
  // 추후 사용 안하면 삭제될 코드 {
  // const bucket = await supabase.storage.getBucket("blog-contents");
  // const id = bucket.data?.id;
  
  // if ( !id ) throw new Error("버켓 ID를 조회하지 못 했습니다.");
  // }
  
  const storage = supabase.storage.from("blog-contents");

  // 파일 경로 생성하기
  const fileUrls = ( await Promise.all(prePaths.flatMap(async (prePath)=>{
    const lists = await storage.list(prePath);
    if (!lists.data || lists.data.length <= 0) return [];
    
    const fileUrls = lists.data.flatMap((file)=> {
      const {data: {publicUrl} } = storage.getPublicUrl(path.join(prePath, file.name))
      return publicUrl
    });

    return fileUrls;
  }))).flat();

  return fileUrls;
}

function convertFileToPost( file: string, metadata: PostMetadata & { slug: string, locale: Locales } ): PostInsertDto {
  return {
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    content: file,
    slug: metadata.slug,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(metadata.published),
    locale: metadata.locale,
  }
}

function parseLocaleAndSlugFromUrl(fileUrl: string): { locale: Locales, category: string, slug: string  } {
  const preReg = /https:\/\/.*posts\//;
  const paths = fileUrl.replace(preReg, "")
  const [locale, category, filename] = paths.split("/");
  const localeTyped = (locale as unknown) as Locales;
  return {locale: localeTyped, category, slug: filename.replace(".md", "")};
}

migration();