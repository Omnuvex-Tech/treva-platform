export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  author?: string;
  authorImage?: string;
  authorTitle?: string;
  content?: React.ReactNode; // For now, we can pass JSX, but in a real CMS it would be HTML/Markdown
  description?: string;
  srcSet?: string;
}

export interface ArticleCard extends Omit<Article, 'content'> {}
