import { revalidatePath } from "next/cache";
import { authorizeAdminApi, adminApiError } from "@/lib/admin/api-auth";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Called by the blog studio after a save or delete, so the public blog, the
 *  post itself and the home page's latest posts show the change right away. */
export async function POST(request: Request) {
  const auth = await authorizeAdminApi("blog");
  if (!auth.ok) return adminApiError(auth.status);

  let slugs: string[] = [];
  try {
    const body = (await request.json()) as { slugs?: unknown };
    if (Array.isArray(body.slugs)) {
      slugs = body.slugs.filter((slug): slug is string => typeof slug === "string" && SLUG.test(slug)).slice(0, 10);
    }
  } catch {
    // No slugs: the lists still refresh.
  }

  revalidatePath("/blog");
  revalidatePath("/");
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`);
  return Response.json({ revalidated: true });
}
