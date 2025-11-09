import { createClient, SupabaseClient } from "@supabase/supabase-js";
import axios from 'axios';
import * as dotenv from "dotenv";
import path from 'path';
import { exportFrontmatter } from "./util";
import { Locales, PostInsertDto, PostMetadata } from "@blog-editor/types/Post";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const locales = ["ko", "en-US"];
const categories = ["development", "movie", "book"];

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
    // 파일 URL 불러오기
    const fileUrls = await getPostFileUrls(supabase);

    // 개별 파일 불러와서 메타데이터 추출하기
    const fileTotalCount = fileUrls.length;
    for (const [idx, fileUrl] of fileUrls.slice(0, 1).entries()) {
      console.log(`process current status: ${idx + 1} / ${fileTotalCount}`);
      
      const {data: file} = await axios.get(fileUrl);


      const { data : {frontmatter: metadata}} = await exportFrontmatter(file);
      console.log("File Metadata");
      console.log(metadata);

      // TODO: slug와 locale 빼내는 작업(URL 에서 파싱하는게 좋을 것 같음)
      convertFileToPost(file, {...(metadata as PostMetadata) });
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

  console.log(`fileUrls => ${[fileUrls]}`)

  return fileUrls;
}

function convertFileToPost( file: string, metadata: PostMetadata & { slug: string, locale: Locales } ): PostInsertDto {
  return {
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    content: file,
    slug: metadata.slug,
    createdDate: new Date(),
    updatedDate: new Date(),
    publishedDate: new Date(metadata.published),
    language: metadata.locale,
  }
}

migration();




