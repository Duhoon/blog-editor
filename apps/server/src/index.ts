import 'dotenv/config';

import express, { Request, Response } from 'express';
import {logger, log} from './logger';
import { upload } from './utils/multer';
import { supabase } from './external/supabase';
import { locales, PostDetail, PostDetailResponse, PostPublishRequest, PostPublishResponse, RecentPostsResponse, RecentPostSummary } from '@blog-editor/types/Post';

const PORT_NUMBER = 8081;

const app = express();

app.use(log);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/list", (req: Request, res: Response)=>{
    res.send("Hello World!");
})

app.get(
    "/posts/recent",
    async (
        req: Request<{}, RecentPostsResponse | {message: string}, {}, {limit?: string}>,
        res: Response<RecentPostsResponse | {message: string}>
    )=> {
        try {
            const requestedLimit = Number.parseInt(req.query.limit ?? "10", 10);
            const limit = Number.isNaN(requestedLimit)
                ? 10
                : Math.min(Math.max(requestedLimit, 1), 20);

            const {data, error} = await supabase
                .from("posts")
                .select("id, title, slug, locale, updated_at, published_at, is_published")
                .order("updated_at", {ascending: false})
                .limit(limit);

            if (error) throw error;

            const posts: RecentPostSummary[] = (data ?? []).map((post)=>({
                id: post.id,
                title: post.title,
                slug: post.slug,
                locale: post.locale,
                updatedAt: post.updated_at,
                publishedAt: post.published_at,
                isPublished: Boolean(post.is_published),
            }));

            res.status(200).json({posts});
            return;
        } catch(err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(`최근 포스트 목록 조회에 실패했습니다. ${message}`);
            res.status(500).json({message: "최근 포스트 목록 조회에 실패했습니다."});
            return;
        }
    }
)

app.get(
    "/posts/:id",
    async (
        req: Request<{id: string}, PostDetailResponse | {message: string}>,
        res: Response<PostDetailResponse | {message: string}>
    )=> {
        try {
            const postId = Number.parseInt(req.params.id, 10);
            if (Number.isNaN(postId)) {
                res.status(400).json({message: "올바르지 않은 포스트 ID입니다."});
                return;
            }

            const {data: post, error: postError} = await supabase
                .from("posts")
                .select("id, title, slug, locale, brief, thumbnail, content, updated_at, published_at, is_published")
                .eq("id", postId)
                .maybeSingle();

            if (postError) throw postError;

            if (!post) {
                res.status(404).json({message: "포스트를 찾을 수 없습니다."});
                return;
            }

            const {data: categoryLinks, error: categoryError} = await supabase
                .from("post_category_links")
                .select("category_id")
                .eq("post_id", postId)
                .eq("is_active", true)
                .limit(1);

            if (categoryError) throw categoryError;

            const {data: tagLinks, error: tagLinkError} = await supabase
                .from("tag_post_links")
                .select("tag_id")
                .eq("post_id", postId)
                .eq("is_active", true);

            if (tagLinkError) throw tagLinkError;

            const tagIds = (tagLinks ?? []).map((link)=> link.tag_id);
            let tags: string[] = [];

            if (tagIds.length > 0) {
                const {data: tagEntries, error: tagError} = await supabase
                    .from("tags")
                    .select("id, name")
                    .in("id", tagIds);

                if (tagError) throw tagError;

                const tagNameById = new Map((tagEntries ?? []).map((tag)=> [tag.id, tag.name]));
                tags = tagIds.flatMap((tagId)=> {
                    const tagName = tagNameById.get(tagId);
                    return tagName ? [tagName] : [];
                });
            }

            const detail: PostDetail = {
                id: post.id,
                title: post.title,
                slug: post.slug,
                locale: post.locale,
                brief: post.brief ?? "",
                thumbnail: post.thumbnail ?? "",
                content: post.content,
                categoryId: categoryLinks?.[0]?.category_id ?? "",
                tags,
                updatedAt: post.updated_at,
                publishedAt: post.published_at,
                isPublished: Boolean(post.is_published),
            };

            res.status(200).json({post: detail});
            return;
        } catch(err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(`포스트 상세 조회에 실패했습니다. ${message}`);
            res.status(500).json({message: "포스트 상세 조회에 실패했습니다."});
            return;
        }
    }
)

app.post(
    "/posts",
    async (
        req: Request<{}, PostPublishResponse | {message: string}, PostPublishRequest>,
        res: Response<PostPublishResponse | {message: string}>
    )=> {
        try {
            const {
                title,
                slug,
                locale,
                categoryId,
                brief,
                thumbnail,
                tags,
                content,
            } = req.body;

            if (!title?.trim()) {
                res.status(400).json({message: "제목을 입력하세요."});
                return;
            }

            if (!slug?.trim()) {
                res.status(400).json({message: "슬러그를 입력하세요."});
                return;
            }

            if (!locale || !locales.includes(locale)) {
                res.status(400).json({message: "지원하지 않는 언어입니다."});
                return;
            }

            if (!categoryId?.trim()) {
                res.status(400).json({message: "카테고리를 선택하세요."});
                return;
            }

            if (!content?.trim()) {
                res.status(400).json({message: "본문을 입력하세요."});
                return;
            }

            const normalizedSlug = slug.trim();
            const {data: existingPost, error: existingPostError} = await supabase
                .from("posts")
                .select("id")
                .eq("slug", normalizedSlug)
                .eq("locale", locale)
                .maybeSingle();

            if (existingPostError) throw existingPostError;

            if (existingPost) {
                res.status(409).json({message: "이미 같은 언어에 같은 슬러그의 글이 있습니다."});
                return;
            }

            const now = new Date();
            const {data: insertedPost, error: postInsertError} = await supabase
                .from("posts")
                .insert({
                    title: title.trim(),
                    brief: brief?.trim() || null,
                    content,
                    slug: normalizedSlug,
                    locale,
                    created_at: now,
                    updated_at: now,
                    published_at: now,
                    thumbnail: thumbnail?.trim() || null,
                    is_published: true,
                })
                .select("id, slug")
                .single();

            if (postInsertError) throw postInsertError;

            const {error: categoryLinkInsertError} = await supabase
                .from("post_category_links")
                .insert({
                    post_id: insertedPost.id,
                    category_id: categoryId,
                    is_active: true,
                });

            if (categoryLinkInsertError) throw categoryLinkInsertError;

            const normalizedTags = [...new Set((tags ?? []).map(tag=> tag.trim()).filter(Boolean))];

            for (const tagName of normalizedTags) {
                const {data: existingTag, error: tagSelectError} = await supabase
                    .from("tags")
                    .select("id")
                    .eq("name", tagName)
                    .maybeSingle();

                if (tagSelectError) throw tagSelectError;

                const tagId = existingTag?.id ?? (await supabase
                    .from("tags")
                    .insert({name: tagName, created_at: now, updated_at: now})
                    .select("id")
                    .single()
                ).data?.id;

                if (!tagId) {
                    throw new Error(`태그 저장에 실패했습니다: ${tagName}`);
                }

                const {error: tagPostLinkInsertError} = await supabase
                    .from("tag_post_links")
                    .insert({
                        post_id: insertedPost.id,
                        tag_id: tagId,
                        is_active: true,
                    });

                if (tagPostLinkInsertError) throw tagPostLinkInsertError;
            }

            res.status(201).json({
                id: insertedPost.id,
                slug: insertedPost.slug,
            });
            return;
        } catch(err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(`포스트 발행에 실패했습니다. ${message}`);
            res.status(500).json({message: "포스트 발행에 실패했습니다."});
            return;
        }
    }
)

app.post(
    "/image", 
    upload.single("image") ,
    async (req: Request, res: Response)=> {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).send();
                return;
            }

            const fileName = `${Date.now()}_${file.originalname}`;

            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET_NAME!)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });
            
            if (error) throw error;

            const {data: publicUrlData} = supabase.storage
                .from(process.env.SUPABASE_BUCKET_NAME!)
                .getPublicUrl(fileName)

            res.status(200).json({
                message: "이미지 업로드 완료",
                url: publicUrlData,
            });

            return; 
        } catch(err) {
            if (err instanceof Error){
                console.log(`이미지 업로드에 실패했습니다. ${err.message}`);
            } else {
                console.log(`이미지 업로드에 실패했습니다. ${err}`);
            }

            res.status(500).send();
            return;
        }
    }
)

app.listen(PORT_NUMBER,()=>{
    logger.info(`Running server on ${PORT_NUMBER}`);
})
