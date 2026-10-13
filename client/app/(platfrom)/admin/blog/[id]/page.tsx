"use client";

import { use, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon as Back,
  Cancel01Icon as Remove,
  ImageAdd01Icon as ImageAdd,
  Settings02Icon as SettingsIcon,
  ViewIcon as Eye,
} from "@hugeicons/core-free-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/uploads";
import { ApiError } from "@/lib/auth";
import { createBlogPost, getBlogPost, slugify, updateBlogPost, type BlogPost, type BlogPostInput } from "@/lib/blog";
import { PostBody } from "@/components/blog/post-body";
import { MarkdownEditor, type MarkdownEditorHandle } from "@/components/blog/markdown-editor";

const MAX_EXCERPT = 400;
const MAX_TAGS = 8;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type View = "write" | "split" | "preview";
type SaveAction = "save" | "publish" | "unpublish";

interface Draft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string[];
  authorName: string;
  /** For <input type="datetime-local">, in the admin's own time zone. Empty = set when published. */
  publishedAt: string;
}

const EMPTY: Draft = { title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", tags: [], authorName: "", publishedAt: "" };

/** An ISO time as <input type="datetime-local"> wants it, in local time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDraft(post: BlogPost): Draft {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? "",
    tags: post.tags,
    authorName: post.authorName ?? "",
    publishedAt: toLocalInput(post.publishedAt),
  };
}

/** What's wrong with the draft, in the admin's terms, or null. */
function problem(draft: Draft, isNew: boolean): string | null {
  if (!draft.title.trim()) return "Give the post a title.";
  if ((!isNew || draft.slug) && !SLUG_PATTERN.test(draft.slug)) return "The address can only have lowercase letters, numbers and hyphens.";
  if (draft.excerpt.length > MAX_EXCERPT) return `The summary is over ${MAX_EXCERPT} characters.`;
  if (draft.coverImageUrl.trim() && !/^(https?:\/\/|\/(?!\/))/i.test(draft.coverImageUrl.trim())) return "The cover image must be an https:// address, or a path on this site starting with /";
  return null;
}

const label = "block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

/** Tags as chips: Enter or a comma adds one, Backspace on an empty box takes the last one off. */
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState("");
  const full = tags.length >= MAX_TAGS;

  const add = (raw: string) => {
    const next = raw.split(",").map((t) => t.trim().slice(0, 40)).filter((t) => t && !tags.includes(t));
    if (next.length) onChange([...tags, ...next].slice(0, MAX_TAGS));
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-input/20 px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/40">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pr-1 pl-2.5 text-xs font-medium text-foreground">
          {tag}
          <button type="button" aria-label={`Remove the tag ${tag}`} onClick={() => onChange(tags.filter((t) => t !== tag))} className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground">
            <HugeiconsIcon icon={Remove} strokeWidth={2.5} className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        id="post-tags"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => text.trim() && add(text)}
        disabled={full}
        placeholder={full ? `${MAX_TAGS} at most` : tags.length ? "Add another" : "product, engineering"}
        className="h-6 min-w-[6rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: post, isLoading, isError } = useQuery({ queryKey: ["admin", "blog", id], queryFn: () => getBlogPost(id), enabled: !isNew });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saved, setSaved] = useState<Draft>(EMPTY);
  // Until the address is typed by hand, it follows the title.
  const [slugTouched, setSlugTouched] = useState(false);
  const [view, setView] = useState<View>("write");
  const [showSettings, setShowSettings] = useState(true);
  const [saving, setSaving] = useState<null | SaveAction>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);
  const editor = useRef<MarkdownEditorHandle>(null);
  const preview = useRef<HTMLDivElement>(null);
  const loadedFor = useRef<string | null>(null);

  // Fill the form once per post, not on every refetch: a refetch mustn't wipe what's being typed.
  useEffect(() => {
    if (post && loadedFor.current !== post.id) {
      loadedFor.current = post.id;
      const next = toDraft(post);
      setDraft(next);
      setSaved(next);
      setSlugTouched(true);
    }
  }, [post]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const status = isNew ? "draft" : (post?.status ?? "draft");
  const published = status === "published";

  // Closing the tab with unsaved work asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setTitle = (title: string) => setDraft((d) => ({ ...d, title, slug: slugTouched ? d.slug : slugify(title) }));

  const save = async (action: SaveAction) => {
    if (saving) return;
    const issue = problem(draft, isNew);
    if (issue) {
      toast.add({ title: issue, type: "error" });
      return;
    }
    if (action === "publish" && !draft.content.trim()) {
      toast.add({ title: "Write the post before publishing it.", type: "error" });
      return;
    }
    setSaving(action);
    try {
      const input: BlogPostInput = {
        title: draft.title.trim(),
        // An address nobody typed is left for the server to choose, so a second
        // post with the same title gets "-2" instead of being refused.
        ...(draft.slug && (slugTouched || !isNew) ? { slug: draft.slug } : {}),
        excerpt: draft.excerpt.trim() || null,
        content: draft.content,
        coverImageUrl: draft.coverImageUrl.trim() || null,
        tags: draft.tags,
        authorName: draft.authorName.trim() || null,
        ...(draft.publishedAt ? { publishedAt: new Date(draft.publishedAt).toISOString() } : {}),
        ...(action === "publish" ? { status: "published" as const } : action === "unpublish" ? { status: "draft" as const } : {}),
      };
      const result = isNew ? await createBlogPost(input) : await updateBlogPost(id, input);
      const next = toDraft(result);
      setDraft(next);
      setSaved(next);
      setSavedAt(new Date());
      queryClient.setQueryData(["admin", "blog", result.id], result);
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"], exact: true });
      if (action !== "save") {
        toast.add({ title: action === "publish" ? "Published. It's on the website within a minute." : "Moved back to drafts.", type: "success" });
      }
      if (isNew) {
        loadedFor.current = result.id;
        router.replace(`/admin/blog/${result.id}`);
      }
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : "Couldn't save the post.", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  // Ctrl+S / ⌘S saves, from anywhere on the page. Reads the newest `save` through a ref.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current("save");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const uploadImage = async (file: File) => (await uploadFile(file)).fileUrl;

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.add({ title: "Choose an image file.", type: "error" });
      return;
    }
    setCoverBusy(true);
    try {
      set("coverImageUrl", await uploadImage(file));
      setCoverBroken(false);
    } catch (err) {
      toast.add({ title: "Couldn't upload the image.", description: err instanceof Error ? err.message : undefined, type: "error" });
    } finally {
      setCoverBusy(false);
    }
  };

  // In the side-by-side view, the preview follows the writing box.
  const syncScroll = () => {
    const from = editor.current?.textarea;
    const to = preview.current;
    if (!from || !to || view !== "split") return;
    const ratio = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
    to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
  };

  if (!isNew && isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>;
  if (!isNew && (isError || !post)) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-foreground">That post doesn&apos;t exist any more.</p>
        <Link href="/admin/blog" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to all posts
        </Link>
      </div>
    );
  }

  const busy = saving !== null;
  const words = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;
  const cover = draft.coverImageUrl.trim();
  const saveState = saving === "save" ? "Saving…" : dirty ? "Unsaved changes" : savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : isNew ? "" : "All changes saved";

  return (
    <div>
      {/* Stays in view while writing: where you are, the post's state, and what you can do with it */}
      <div className="sticky top-0 z-20 -mx-6 -mt-8 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/blog" aria-label="Back to all posts" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
            <HugeiconsIcon icon={Back} strokeWidth={2} className="h-4 w-4" />
          </Link>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              published ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground",
            )}
          >
            {published ? "Published" : "Draft"}
          </span>
          <span role="status" className={cn("truncate text-xs", dirty && saving !== "save" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
            {saveState}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {published && post && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <HugeiconsIcon icon={Eye} strokeWidth={2} className="h-4 w-4" />
              View on the website
            </a>
          )}
          <Button variant={showSettings ? "secondary" : "ghost"} size="sm" aria-pressed={showSettings} onClick={() => setShowSettings((v) => !v)}>
            <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="h-4 w-4" />
            Details
          </Button>
          {published ? (
            <>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => save("unpublish")}>
                {saving === "unpublish" ? "Moving…" : "Unpublish"}
              </Button>
              <Button size="sm" disabled={busy || !dirty} onClick={() => save("save")}>
                {saving === "save" ? "Saving…" : "Save changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" disabled={busy || (!dirty && !isNew)} onClick={() => save("save")}>
                {saving === "save" ? "Saving…" : "Save draft"}
              </Button>
              <Button size="sm" disabled={busy} onClick={() => save("publish")}>
                {saving === "publish" ? "Publishing…" : "Publish"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={cn("grid gap-8", showSettings && "xl:grid-cols-[minmax(0,1fr)_17rem]")}>
        {/* The post, laid out the way it will read */}
        <div className="min-w-0">
          {/* Cover */}
          {cover && !coverBroken ? (
            <div className="group relative mb-6 overflow-hidden rounded-2xl ring-1 ring-foreground/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied image from any host */}
              <img src={cover} alt="" onError={() => setCoverBroken(true)} className="aspect-[16/7] w-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <label className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "cursor-pointer shadow-sm")}>
                  {coverBusy ? "Uploading…" : "Change"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void uploadCover(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                <Button variant="secondary" size="sm" className="shadow-sm" onClick={() => set("coverImageUrl", "")}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void uploadCover(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "mb-6 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
                coverBusy && "pointer-events-none opacity-60",
              )}
            >
              <HugeiconsIcon icon={ImageAdd} strokeWidth={2} className="h-4 w-4" />
              {coverBusy ? "Uploading the cover…" : coverBroken ? "That cover image couldn't be loaded. Click to upload another." : "Add a cover image: click, or drop one here"}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void uploadCover(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          )}

          {/* Title and summary, in the type they'll be read in */}
          <textarea
            aria-label="Title"
            value={draft.title}
            onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("post-excerpt")?.focus();
              }
            }}
            placeholder="Title"
            maxLength={200}
            rows={1}
            autoFocus={isNew}
            className="block field-sizing-content w-full resize-none bg-transparent font-serif text-[2.5rem] leading-[1.1] font-medium tracking-[-0.025em] text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <textarea
            id="post-excerpt"
            aria-label="Summary"
            value={draft.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="A one or two sentence summary. Shown under the title, in the post list and when the post is shared."
            rows={1}
            className="mt-3 block field-sizing-content w-full resize-none bg-transparent text-lg leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/50"
          />
          {draft.excerpt.length > MAX_EXCERPT - 60 && (
            <p className={cn("mt-1 text-[11px] tabular-nums", draft.excerpt.length > MAX_EXCERPT ? "text-destructive" : "text-muted-foreground")}>
              {draft.excerpt.length}/{MAX_EXCERPT}
            </p>
          )}

          {/* The writing box */}
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2">
              <div role="tablist" aria-label="View" className="inline-flex rounded-lg bg-muted p-0.5 text-xs font-medium">
                {(["write", "split", "preview"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={view === value}
                    onClick={() => {
                      setView(value);
                      // Side by side needs the width the details panel takes.
                      if (value === "split") setShowSettings(false);
                    }}
                    className={cn(
                      "rounded-md px-3 py-1 transition-colors",
                      value === "split" && "hidden lg:block",
                      view === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {value === "write" ? "Write" : value === "split" ? "Side by side" : "Preview"}
                  </button>
                ))}
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {words.toLocaleString()} {words === 1 ? "word" : "words"} · {Math.max(1, Math.ceil(words / 220))} min read
              </span>
            </div>

            <div className={cn("grid h-[max(26rem,calc(100svh-15rem))]", view === "split" && "lg:grid-cols-2 lg:divide-x lg:divide-border")}>
              <MarkdownEditor
                ref={editor}
                value={draft.content}
                onChange={(content) => set("content", content)}
                onUploadImage={uploadImage}
                onUploadError={(message) => toast.add({ title: "Couldn't add the image.", description: message, type: "error" })}
                onScroll={syncScroll}
                placeholder={"Start writing…\n\nUse the buttons above, or type Markdown: ## for a heading, **bold**, - for a list.\nPaste or drop an image to add it."}
                className={cn("min-w-0", view === "preview" && "hidden")}
              />
              {view !== "write" && (
                <div ref={preview} aria-label="Preview" className="min-w-0 overflow-y-auto bg-background px-6 py-2 sm:px-8">
                  {draft.content.trim() ? (
                    <PostBody markdown={draft.content} className={cn("mx-auto max-w-[44rem]", view === "split" && "text-[15px] [&_h1]:text-[1.6rem] [&_h2]:text-[1.4rem]")} />
                  ) : (
                    <p className="py-16 text-center text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Ctrl/⌘+S saves. Ctrl/⌘+B bold, I italic, K link. Paste or drop an image into the post to add it.
          </p>
        </div>

        {/* About the post */}
        {showSettings && (
          <aside aria-label="Post details" className="space-y-5 xl:sticky xl:top-20 xl:self-start">
            <div>
              <label htmlFor="post-slug" className={label}>
                Address
              </label>
              <div className="mt-1.5 flex items-center rounded-md border border-input bg-input/20 text-sm focus-within:ring-2 focus-within:ring-ring/40">
                <span className="shrink-0 pl-2.5 text-muted-foreground">/blog/</span>
                <input
                  id="post-slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder="made-from-the-title"
                  maxLength={160}
                  className="h-9 min-w-0 flex-1 bg-transparent pr-2.5 font-mono text-[13px] outline-none"
                />
              </div>
              {published && draft.slug !== saved.slug && <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">Changing this breaks links to the post that are already out there.</p>}
            </div>

            <div>
              <label htmlFor="post-tags" className={label}>
                Tags
              </label>
              <TagInput tags={draft.tags} onChange={(tags) => set("tags", tags)} />
              <p className="mt-1 text-[11px] text-muted-foreground">Press Enter after each one. Up to {MAX_TAGS}.</p>
            </div>

            <div>
              <label htmlFor="post-author" className={label}>
                Author
              </label>
              <Input id="post-author" value={draft.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Your name, if left empty" maxLength={120} className="mt-1.5 text-sm" />
            </div>

            <div>
              <label htmlFor="post-date" className={label}>
                Date shown
              </label>
              <Input id="post-date" type="datetime-local" value={draft.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className="mt-1.5 text-sm" />
              <p className="mt-1 text-[11px] text-muted-foreground">{draft.publishedAt ? "In your own time zone." : "Left empty, it's the moment you publish."}</p>
            </div>

            <div>
              <label htmlFor="post-cover" className={label}>
                Cover image address
              </label>
              <Input
                id="post-cover"
                value={draft.coverImageUrl}
                onChange={(e) => {
                  setCoverBroken(false);
                  set("coverImageUrl", e.target.value);
                }}
                placeholder="https://… or /a-site-path"
                className="mt-1.5 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Filled in when you upload a cover. Wide images work best. Also used when the post is shared.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
