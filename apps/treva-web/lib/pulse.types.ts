import type { ArticleBlock } from "./pulse-api";

export interface Article {
  id?: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  image?: string;
  coverImage?: string;
  author?: string;
  authorImage?: string;
  authorTitle?: string;
  authorId?: string;
  authorObj?: {
    id: string;
    name: string;
    slug: string;
    title?: string;
    avatar?: string;
  };
  keywords?: { id: string; name: string; slug: string }[];
  content?: React.ReactNode;
  blocks?: ArticleBlock[];
  description?: string;
  excerpt?: string;
  srcSet?: string;
  featured?: boolean;
  published?: boolean;
  headerPosition?: "left" | "center" | "right" | "week";
  headerOrder?: number;
  selectedArticles?: Article[];
  metaTitle?: string;
  metaDescription?: string;
  _searchable?: string;
}

export interface ArticleCard extends Omit<Article, 'content' | 'blocks'> {}
