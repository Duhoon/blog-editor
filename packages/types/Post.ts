export const locales = ["ko", "en-US"] as const;
export type Locales = typeof locales[number];

export interface PostDto {
  title: string;
  brief: string;
  content: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  thumbnail: string;
  locale: Locales;
}

export interface PostInsertDto {
  title: string;
  brief?: string;
  content: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  thumbnail?: string;
  locale: Locales;
}

export interface PostUpdateDto {
  id: number;
  title?: string;
  brief?: string;
  content?: string;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  thumbnail?: string;
  locale?: Locales;
}

export interface PostMetadata {
  layout: string,
  published: string,
  title: string,
  tags: string[],
  thumbnail: string,
}

export interface PostPublishRequest {
  title: string;
  slug: string;
  locale: Locales;
  categoryId: string;
  brief?: string;
  thumbnail?: string;
  tags: string[];
  content: string;
}

export interface PostPublishResponse {
  id: number;
  slug: string;
}

export interface RecentPostSummary {
  id: number;
  title: string;
  slug: string;
  locale: Locales;
  updatedAt: string;
  publishedAt: string | null;
  isPublished: boolean;
}

export interface RecentPostsResponse {
  posts: RecentPostSummary[];
}

export interface PostDetail {
  id: number;
  title: string;
  slug: string;
  locale: Locales;
  brief: string;
  thumbnail: string;
  content: string;
  categoryId: string;
  tags: string[];
  updatedAt: string;
  publishedAt: string | null;
  isPublished: boolean;
}

export interface PostDetailResponse {
  post: PostDetail;
}

export interface ApiErrorResponse {
  message: string;
}
