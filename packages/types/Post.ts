export const locales = ["ko", "en-US"] as const;
export type Locales = typeof locales;

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