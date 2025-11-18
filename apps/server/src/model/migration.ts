import { createClient, SupabaseClient } from "@supabase/supabase-js";
import axios from 'axios';
import * as dotenv from "dotenv";
import path from 'path';
import { exportFrontmatter } from "./util";
import { Locales, PostInsertDto, PostMetadata } from "@blog-editor/types/Post";
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

const migration = async()=>{
  if (!SUPABASE_URL || !SUPABASE_KEY ) return;
  // supabase 클라이언트 연결
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    /**
     * 카테고리 이관
     */
    const categoryEntries = Object.keys(categoryNameData).map(category=>{
      return {
        id: category,
        name: categoryNameData[category],
      }
    });
    await supabase.from("categories").insert(categoryEntries);
    console.log("카테고리 이관 완료");

    /**
     * 포스트 이관
     */
    // 파일 URL 불러오기
    const fileUrls = await getPostFileUrls(supabase);
    console.log(`fileUrls => ${[fileUrls]}`)

    // 개별 파일 불러와서 메타데이터 추출하기
    const fileTotalCount = fileUrls.length;
    for (const [idx, fileUrl] of fileUrls.slice(0, 1).entries()) {
      console.log(`process current status: ${idx + 1} / ${fileTotalCount}`);
      const {data: file} = await axios.get(fileUrl);


      const { data : {frontmatter: metadata}} = await exportFrontmatter(file);
      console.log("File Metadata");
      console.log(metadata);

      const {locale, category, slug} = parseLocaleAndSlugFromUrl(fileUrl)

      const post = convertFileToPost(file, {...(metadata as PostMetadata), locale, slug })
      const {error} = await supabase.from("posts").insert( convertKeysToSnakeCase(post) );
      if (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
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




