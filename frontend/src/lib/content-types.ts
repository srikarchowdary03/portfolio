export interface ContentDoc {
  slug: string;
  type: string;
  title: string;
  tags: string[];
  date: string | null;
  links: Record<string, string>;
  body: string; // markdown, without frontmatter
}
