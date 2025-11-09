import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkParseFrontmatter from 'remark-parse-frontmatter';
import remarkRehype from "remark-rehype";
import remarkFrontmatter from "remark-frontmatter";
import rehypeStringify from "rehype-stringify";

export async function exportFrontmatter(postFile: string) {
  return await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkParseFrontmatter)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(postFile);
}