"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import type { BlogPostRow, BlogStatus } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { shortDate, slugify } from "@/lib/admin/format";
import { cn } from "@/lib/cn";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  cover_image_url: string;
  status: BlogStatus;
};

const emptyDraft: Draft = {
  title: "",
  slug: "",
  cover_image_url: "",
  status: "draft",
};

export function BlogStudio({ posts }: { posts: BlogPostRow[] }) {
  const [items, setItems] = useState(posts);
  const [selectedId, setSelectedId] = useState(posts[0]?.id ?? "");
  const [draft, setDraft] = useState<Draft>(
    posts[0]
      ? {
          id: posts[0].id,
          title: posts[0].title,
          slug: posts[0].slug,
          cover_image_url: posts[0].cover_image_url || "",
          status: posts[0].status,
        }
      : emptyDraft
  );
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => items.find((post) => post.id === selectedId) || null,
    [items, selectedId]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: selected?.content || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] rounded-lg border border-border bg-background/35 px-4 py-4 text-sm font-light leading-relaxed text-foreground outline-none prose-invert focus:border-accent",
      },
    },
  });

  useEffect(() => {
    if (!selected) {
      setDraft(emptyDraft);
      editor?.commands.setContent("<p></p>");
      return;
    }
    setDraft({
      id: selected.id,
      title: selected.title,
      slug: selected.slug,
      cover_image_url: selected.cover_image_url || "",
      status: selected.status,
    });
    editor?.commands.setContent(selected.content || "<p></p>");
  }, [selected, editor]);

  const createNew = () => {
    setSelectedId("");
    setDraft(emptyDraft);
    editor?.commands.setContent("<p></p>");
  };

  const uploadFile = async (file: File, folder: string) => {
    const supabase = createSupabaseBrowserClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("blog-covers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async (nextStatus?: BlogStatus) => {
    if (!editor) return;
    setSaving(true);
    setToast("");

    const status = nextStatus || draft.status;
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim() || slugify(draft.title),
      cover_image_url: draft.cover_image_url || null,
      content: editor.getHTML(),
      status,
      published_at:
        status === "published"
          ? selected?.published_at || new Date().toISOString()
          : null,
    };

    const supabase = createSupabaseBrowserClient();
    const result = draft.id
      ? await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", draft.id)
          .select("*")
          .single()
      : await supabase
          .from("blog_posts")
          .insert(payload)
          .select("*")
          .single();

    setSaving(false);
    if (result.error || !result.data) {
      setToast(result.error?.message || "Could not save post.");
      return;
    }

    const saved = result.data as BlogPostRow;
    setItems((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];
    });
    setSelectedId(saved.id);
    setToast(status === "published" ? "Published." : "Saved draft.");
  };

  const remove = async (post: BlogPostRow) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== post.id));
    setSelectedId("");
    const { error } = await createSupabaseBrowserClient()
      .from("blog_posts")
      .delete()
      .eq("id", post.id);
    if (error) {
      setItems(previous);
      setToast(error.message);
    } else {
      setToast("Deleted.");
    }
  };

  const handleCover = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadFile(file, "covers");
      setDraft((current) => ({ ...current, cover_image_url: url }));
      setToast("Cover uploaded.");
    } catch (error) {
      setToast((error as Error).message);
    }
  };

  const handleInlineImage = async (file?: File) => {
    if (!file || !editor) return;
    try {
      const url = await uploadFile(file, "inline");
      editor.chain().focus().setImage({ src: url }).run();
      setToast("Image inserted.");
    } catch (error) {
      setToast((error as Error).message);
    }
  };

  const setTitle = (value: string) => {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: current.slug || slugify(value),
    }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="rounded-lg border border-border bg-[#141414]/72 p-4">
        <Button className="mb-4 w-full" onClick={createNew}>
          <Plus className="h-4 w-4" />
          New post
        </Button>

        <div className="space-y-2">
          {items.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedId(post.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left transition-colors",
                selectedId === post.id
                  ? "border-accent/45 bg-accent/10"
                  : "border-border bg-background/25 hover:border-foreground/25"
              )}
            >
              <span className="block text-sm font-medium text-foreground">
                {post.title}
              </span>
              <span className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>{post.status}</span>
                <span>{shortDate(post.updated_at || post.created_at)}</span>
              </span>
            </button>
          ))}
          {!items.length && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
              No posts yet.
            </div>
          )}
        </div>
      </aside>

      <section className="rounded-lg border border-border bg-[#141414]/72 p-5">
        <div className="grid gap-6">
          <div>
            <label htmlFor="post-title" className="eyebrow mb-3 block">
              Title
            </label>
            <input
              id="post-title"
              value={draft.title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Post title"
              className="w-full border-0 border-b border-border bg-transparent pb-3 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted/40 focus:border-accent"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
            <div>
              <label htmlFor="post-slug" className="eyebrow mb-3 block">
                Slug
              </label>
              <TextInput
                id="post-slug"
                value={draft.slug}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="post-url-slug"
              />
            </div>
            <label>
              <span className="eyebrow mb-3 block">Status</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value as BlogStatus,
                  }))
                }
                className="h-11 w-full rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <div>
            <p className="eyebrow mb-3">Cover image</p>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleCover(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex min-h-36 w-full items-center justify-center rounded-lg border border-dashed border-border bg-background/30 text-sm text-muted transition-colors hover:border-accent/45 hover:text-foreground"
            >
              {draft.cover_image_url ? (
                <span className="text-foreground">Cover uploaded - click to replace</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Upload cover
                </span>
              )}
            </button>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <ToolbarButton
                label="Bold"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive("bold")}
                Icon={Bold}
              />
              <ToolbarButton
                label="Italic"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive("italic")}
                Icon={Italic}
              />
              <ToolbarButton
                label="H2"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor?.isActive("heading", { level: 2 })}
                Icon={Heading2}
              />
              <ToolbarButton
                label="H3"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor?.isActive("heading", { level: 3 })}
                Icon={Heading3}
              />
              <ToolbarButton
                label="Bullets"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                active={editor?.isActive("bulletList")}
                Icon={List}
              />
              <ToolbarButton
                label="Numbers"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                active={editor?.isActive("orderedList")}
                Icon={ListOrdered}
              />
              <ToolbarButton
                label="Quote"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                active={editor?.isActive("blockquote")}
                Icon={Quote}
              />
              <ToolbarButton
                label="Link"
                onClick={() => {
                  const url = window.prompt("Paste a URL");
                  if (url) editor?.chain().focus().setLink({ href: url }).run();
                }}
                active={editor?.isActive("link")}
                Icon={LinkIcon}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleInlineImage(event.target.files?.[0])}
              />
              <ToolbarButton
                label="Image"
                onClick={() => imageInputRef.current?.click()}
                Icon={ImageIcon}
              />
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        {toast && <p className="mt-5 text-sm text-muted">{toast}</p>}

        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={() => save()} disabled={saving || !draft.title.trim()}>
            {saving ? "saving" : "Save"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => save("published")}
            disabled={saving || !draft.title.trim()}
          >
            Publish
          </Button>
          {selected && (
            <Button variant="ghost" onClick={() => remove(selected)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function ToolbarButton({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-md border transition-colors",
        active
          ? "border-accent bg-accent text-background"
          : "border-border bg-background/35 text-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
