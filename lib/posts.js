import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDir = path.join(process.cwd(), 'content/posts');

// Returns all posts sorted newest-first, without body content (for list page)
export function getAllPosts() {
  const filenames = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  return filenames
    .map(filename => {
      const slug = filename.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8');
      const { data, content } = matter(raw);

      // Build a plain-text excerpt from the first non-empty paragraph
      const excerpt = content
        .split('\n')
        .find(line => line.trim().length > 0 && !line.startsWith('#'))
        ?.slice(0, 160) || '';

      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        excerpt,
      };
    })
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
}

// Returns a single post with rendered HTML body (for post page)
export async function getPostBySlug(slug) {
  const filepath = path.join(postsDir, `${slug}.md`);
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    contentHtml,
  };
}

// Returns all slugs (used by generateStaticParams)
export function getAllSlugs() {
  return fs
    .readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}
