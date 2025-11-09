export const locales = ["ko", "en-US"] as const;
export type Locales = typeof locales;

export interface PostInsertDto {
  title: string;
  brief?: string;
  content: string;
  slug: string;
  createdDate: Date;
  updatedDate: Date;
  publishedDate?: Date;
  thumbnail?: string;
  language: Locales;
}

export interface PostUpdateDto {
  id: number;
  title?: string;
  brief?: string;
  content?: string;
  slug?: string;
  createdDate?: Date;
  updatedDate?: Date;
  publishedDate?: Date;
  thumbnail?: string;
  language?: Locales;
}

export interface PostMetadata {
  layout: string,
  published: string,
  title: string,
  tags: string[],
  thumbnail: string,
}