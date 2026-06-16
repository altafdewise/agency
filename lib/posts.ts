import fs from "node:fs";
import path from "node:path";
import { remark } from "remark";
import html from "remark-html";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/** Blog posts are plain markdown files in /content/blog with frontmatter:
 *  --- title / date (YYYY-MM-DD) / excerpt --- then the body. Add files to
 *  publish — no code changes needed. */
const DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
}

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  content: string;
} {
  if (!raw.startsWith("---")) return { data: {}, content: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: raw };

  const block = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trimStart();
  const data: Record<string, string> = {};

  for (const line of block.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) data[key] = value;
  }

  return { data, content };
}

function readMeta(file: string): PostMeta {
  const slug = file.replace(/\.md$/, "");
  const { data } = parseFrontmatter(fs.readFileSync(path.join(DIR, file), "utf8"));
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    date: typeof data.date === "string" ? data.date : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
  };
}

function getMarkdownPosts(): PostMeta[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug,title,published_at,created_at,content,cover_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (!error && data?.length) {
      return data.map((post) => ({
        slug: post.slug,
        title: post.title,
        date: post.published_at || post.created_at,
        excerpt: post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150),
        coverImage: post.cover_image_url || undefined,
      }));
    }
  }

  return getMarkdownPosts();
}

export async function getSlugs(): Promise<string[]> {
  return (await getAllPosts()).map((p) => p.slug);
}

export async function getPost(
  slug: string
): Promise<{ meta: PostMeta; html: string } | null> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!error && data) {
      return {
        meta: {
          slug: data.slug,
          title: data.title,
          date: data.published_at || data.created_at,
          excerpt: data.content
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 150),
          coverImage: data.cover_image_url || undefined,
        },
        html: data.content,
      };
    }
  }

  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  const processed = await remark().use(html).process(content);
  return {
    meta: {
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      date: typeof data.date === "string" ? data.date : "",
      excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    },
    html: processed.toString(),
  };
}

export function formatDate(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
