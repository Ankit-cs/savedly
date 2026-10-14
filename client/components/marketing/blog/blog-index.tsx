"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon as ArrowRight, RssIcon as Rss } from "@hugeicons/core-free-icons";
import { HeroReveal } from "@/components/marketing/motion/hero-reveal";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { LogoMark } from "@/components/logo";
import { formatPostDate, type BlogPostSummary } from "@/lib/blog";
import { DISCORD_URL } from "@/lib/open-source";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The blog's index, in the About page's manner: one font, the headline
// rising in (GSAP), the newest post large with its picture drifting as you
// scroll (GSAP), and the rest as a list you can narrow by topic, the rows
// rearranging as you switch (Motion). A post without a picture, or whose
// picture won't load, gets a cover made of its own title instead of a
// broken image.

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_TOPICS = 6;

function Byline({ post, className }: { post: BlogPostSummary; className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <time dateTime={post.publishedAt ?? undefined}>{formatPostDate(post.publishedAt)}</time>
      <span className="mx-2" aria-hidden>
        ·
      </span>
      {post.readingMinutes} min read
      {post.authorName && (
        <>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          {post.authorName}
        </>
      )}
    </p>
  );
}

/** The post's picture, or, when it has none or it fails to load, a cover set in its own title. */
function Cover({ post, size, className }: { post: BlogPostSummary; size: "large" | "small"; className?: string }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // An image that failed before the page came alive never fires onError,
  // so check once on mount as well.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth === 0) setFailed(true);
  }, []);
  if (post.coverImageUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- an admin-supplied image from any host
      <img ref={img} src={post.coverImageUrl} alt="" loading="lazy" onError={() => setFailed(true)} className={cn("h-full w-full object-cover", className)} />
    );
  }
  // Large, the title is already beside it, so the cover carries the mark; small, in a list, the title helps.
  return (
    <div aria-hidden className={cn("relative flex h-full w-full overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent", size === "large" ? "items-center justify-center" : "items-end", className)}>
      <span className="absolute -top-1/4 -right-1/4 h-3/4 w-3/4 rounded-full bg-primary/15 blur-3xl" />
      {size === "large" ? (
        <LogoMark className="relative h-20 w-20 opacity-90 sm:h-24 sm:w-24" ticks={false} />
      ) : (
        <span className="relative p-4 text-base leading-tight font-medium tracking-[-0.03em] text-balance text-foreground/80">{post.title}</span>
      )}
    </div>
  );
}

function Topics({ topics, value, onChange }: { topics: string[]; value: string | null; onChange: (topic: string | null) => void }) {
  const options: (string | null)[] = [null, ...topics];
  return (
    <LayoutGroup id="blog-topics">
      <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-1.5">
        {options.map((topic) => {
          const selected = value === topic;
          return (
            <button
              key={topic ?? "all"}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(topic)}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                selected ? "text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {selected && <motion.span layoutId="blog-topic" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{topic ?? "All posts"}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [latest, ...rest] = posts;

  // The most-used topics first, so the row stays short.
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, MAX_TOPICS).map(([tag]) => tag);
  }, [posts]);

  // With a topic picked, the list holds every post on it, the newest included.
  const shown = topic ? posts.filter((p) => p.tags.includes(topic)) : rest;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The newest post's picture drifts a little slower than the page.
        gsap.fromTo("[data-cover-drift]", { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: "[data-featured]", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.from("[data-featured]", { autoAlpha: 0, y: 40, duration: 1, ease: "power3.out", delay: 0.35 });
      });
    },
    { scope: root },
  );

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root}>
        <HeroReveal className="flex flex-col items-center px-5 pt-40 pb-14 text-center sm:px-8 md:pt-48">
          <h1 className="text-[clamp(2.75rem,7vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.045em] text-balance text-foreground">Notes from building Savedly</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
            How it works, what changed, and what we learned along the way, written by the people making it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <a href="/blog/feed.xml" className="inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
              <HugeiconsIcon icon={Rss} strokeWidth={2} className="h-4 w-4" />
              Follow with RSS
            </a>
            <Link href="/changelog" className="font-medium text-muted-foreground transition-colors hover:text-foreground">
              Or see what shipped
            </Link>
          </div>
        </HeroReveal>

        <div className="px-5 pb-24 sm:px-8 md:pb-32">
          <div className="mx-auto max-w-6xl">
            {!latest ? (
              <EmptyState
                title="The first post is on its way"
                description="Until then, the changelog has everything that has shipped, and How it works explains what happens to what you save."
                action={
                  <Link href="/how-it-works" className="text-sm font-medium text-foreground underline underline-offset-4">
                    How it works
                  </Link>
                }
              />
            ) : (
              <>
                {/* The newest post, large */}
                <article data-featured>
                  <Link href={`/blog/${latest.slug}`} className="group grid overflow-hidden rounded-[2rem] bg-muted/50 ring-1 ring-foreground/[0.06] transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:grid-cols-[1.15fr_1fr]">
                    <div className="relative aspect-[16/10] overflow-hidden lg:order-2 lg:aspect-auto lg:min-h-[26rem]">
                      <div data-cover-drift className="absolute inset-0">
                        <Cover post={latest} size="large" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end p-7 sm:p-10">
                      <p className="text-sm font-medium text-primary">Latest</p>
                      <h2 className="mt-3 text-[clamp(1.875rem,3.4vw,2.75rem)] font-medium leading-[1.06] tracking-[-0.035em] text-balance text-foreground">{latest.title}</h2>
                      {latest.excerpt && <p className="mt-4 line-clamp-4 text-lg leading-relaxed text-pretty text-muted-foreground">{latest.excerpt}</p>}
                      <Byline post={latest} className="mt-6" />
                      <span className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-medium text-foreground">
                        Read it
                        <HugeiconsIcon icon={ArrowRight} strokeWidth={2} className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </article>

                {/* Everything else, narrowed by topic */}
                {(rest.length > 0 || topics.length > 0) && (
                  <section aria-labelledby="all-posts" className="mt-20">
                    <div className="flex flex-col gap-5 border-b border-foreground/10 pb-6 md:flex-row md:items-end md:justify-between">
                      <h2 id="all-posts" className="text-[clamp(1.75rem,3.2vw,2.25rem)] font-medium tracking-[-0.035em] text-foreground">
                        {topic ? `On ${topic}` : "More posts"}
                      </h2>
                      {topics.length > 1 && <Topics topics={topics} value={topic} onChange={setTopic} />}
                    </div>

                    <motion.ul layout className="relative">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {shown.map((post) => (
                          <motion.li
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
                            transition={{ duration: 0.6, ease: EASE }}
                            className="border-b border-foreground/10"
                          >
                            <Link href={`/blog/${post.slug}`} className="group grid gap-5 py-8 focus-visible:outline-none sm:grid-cols-[1fr_12rem] sm:gap-10 md:grid-cols-[10rem_1fr_14rem]">
                              <time dateTime={post.publishedAt ?? undefined} className="hidden pt-1 text-sm text-muted-foreground md:block">
                                {formatPostDate(post.publishedAt)}
                              </time>
                              <div className="min-w-0">
                                <h3 className="text-xl font-medium leading-snug tracking-[-0.02em] text-balance text-foreground underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-foreground/30 sm:text-2xl">
                                  {post.title}
                                </h3>
                                {post.excerpt && <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">{post.excerpt}</p>}
                                <p className="mt-3 text-sm text-muted-foreground">
                                  <span className="md:hidden">{formatPostDate(post.publishedAt)} · </span>
                                  {post.readingMinutes} min read
                                  {post.tags.length > 0 && <span className="text-muted-foreground/70"> · {post.tags.slice(0, 3).join(", ")}</span>}
                                </p>
                              </div>
                              <div className="order-first aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-foreground/[0.07] sm:order-none">
                                <Cover post={post} size="small" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                              </div>
                            </Link>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </motion.ul>

                    {shown.length === 0 && (
                      <p className="py-12 text-center text-[15px] text-muted-foreground">
                        {topic ? "Only the newest post is on this topic so far." : "Only the post above so far. More are on the way."}
                      </p>
                    )}
                  </section>
                )}

                {/* Where to hear about the next one */}
                <div className="mt-20 flex flex-col items-center gap-3 text-center">
                  <p className="text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.03em] text-balance text-foreground">Get the next post when it&apos;s out</p>
                  <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    Add the RSS feed to your reader, or join the Discord to talk about them.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <a href="/blog/feed.xml" className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-opacity hover:opacity-90">
                      <HugeiconsIcon icon={Rss} strokeWidth={2} className="h-4 w-4" />
                      RSS feed
                    </a>
                    <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-full px-6 text-[15px] font-medium text-foreground ring-1 ring-foreground/15 transition-colors hover:bg-foreground/5">
                      Join the Discord
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
