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

export interface ApiErrorResponse {
  message: string;
}
