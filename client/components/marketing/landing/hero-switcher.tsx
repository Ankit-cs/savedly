"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight01Icon as ArrowRightIcon,
  BookmarkAdd01Icon as SaveIcon,
  BubbleChatIcon as AskIcon,
  FolderLibraryIcon as OrganizeIcon,
  Search01Icon as SearchIcon,
} from "@hugeicons/core-free-icons";
import { Navbar } from "@/components/marketing/navbar";
import { GithubStarButton } from "@/components/marketing/github-star-button";
import { ProductHuntBadge } from "@/components/marketing/product-hunt-badge";
import { useAuthCta } from "@/hooks/use-auth-cta";
import { cn } from "@/lib/utils";
import { AskScene, OrganizeScene, SaveScene, SearchScene } from "@/components/marketing/landing/product-scenes";

// The hero: a plain statement, then the product shown as four small scenes
// on a coloured panel. On a wide screen the panel holds still while you
// scroll and the scenes change under it; on a phone they advance by
// themselves and by tap.

const EASE = [0.16, 1, 0.3, 1] as const;

interface Tab {
  id: string;
  label: string;
  icon: IconSvgElement;
  title: string;
  body: string;
  href: string;
  Scene: () => React.ReactNode;
  /** Three colours for the panel behind this scene. */
  tones: [string, string, string];
}

const TABS: Tab[] = [
  {
    id: "save",
    label: "Save",
    icon: SaveIcon,
    title: "Save it in one step",
    body: "Paste a link, drop a file, or type a note. Savedly reads it, writes a summary, tags it, and files it in the right collection.",
    href: "/features#how-it-works",
    Scene: SaveScene,
    tones: ["#9dbcff", "#c3e6ff", "#b9c8ff"],
  },
  {
    id: "search",
    label: "Search",
    icon: SearchIcon,
    title: "Find it by what you remember",
    body: "Describe it in your own words. Search matches the meaning as well as the exact words, so a half-remembered idea is enough.",
    href: "/features#search",
    Scene: SearchScene,
    tones: ["#a9b4ff", "#cfc4ff", "#9cc4ff"],
  },
  {
    id: "ask",
    label: "Ask",
    icon: AskIcon,
    title: "Ask your library a question",
    body: "Get an answer in plain words, drawn only from what you saved, with the memories it used listed underneath.",
    href: "/features#ask",
    Scene: AskScene,
    tones: ["#c2b2ff", "#e7c4ff", "#a8b6ff"],
  },
  {
    id: "organize",
    label: "Organize",
    icon: OrganizeIcon,
    title: "Organized without the filing",
    body: "Collections and tags fill themselves in. A date in a note becomes an event you can put on your calendar in one tap.",
    href: "/features#formats",
    Scene: OrganizeScene,
    tones: ["#a6e3ea", "#a9c8ff", "#c4f0d6"],
  },
];

const ROTATE_MS = 6500;

/** Whether the panel should hold still while the page scrolls under it. */
function usePinned(): boolean {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide && !reduce;
}

/** The soft, slowly drifting colour behind the scenes. */
function Backdrop({ tones }: { tones: [string, string, string] }) {
  const reduce = useReducedMotion();
  const blobs = [
    { className: "-left-[10%] -top-[25%] h-[75%] w-[60%]", drift: { x: [0, 40, 0], y: [0, 24, 0] }, seconds: 19 },
    { className: "-right-[12%] top-[5%] h-[80%] w-[58%]", drift: { x: [0, -34, 0], y: [0, 30, 0] }, seconds: 23 },
    { className: "bottom-[-35%] left-[22%] h-[75%] w-[62%]", drift: { x: [0, 26, 0], y: [0, -28, 0] }, seconds: 27 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-primary/[0.07] dark:bg-primary/[0.12]">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full opacity-90 blur-3xl dark:opacity-35", blob.className)}
          animate={{ backgroundColor: tones[i], ...(reduce ? {} : blob.drift) }}
          transition={{
            backgroundColor: { duration: 1.1, ease: "easeInOut" },
            x: { duration: blob.seconds, repeat: Infinity, ease: "easeInOut" },
            y: { duration: blob.seconds, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

function Switcher() {
  const pinned = usePinned();
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  // Wide screens: the scroll position picks the scene.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!pinned) return;
    setActive(Math.min(TABS.length - 1, Math.max(0, Math.floor(progress * TABS.length))));
  });

  // Elsewhere: the scenes take turns until someone picks one.
  useEffect(() => {
    if (pinned || reduce || touched) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % TABS.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, pinned, reduce, touched]);

  function choose(index: number) {
    setTouched(true);
    const el = track.current;
    if (pinned && el) {
      // Move the page to where this scene lives, so scrolling carries on from it.
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((index + 0.5) / TABS.length) * span, behavior: "smooth" });
    } else {
      setActive(index);
    }
  }

  const tab = TABS[active];
  const Scene = tab.Scene;

  return (
    <div ref={track} className={cn("relative mt-14 md:mt-20", pinned && "h-[330vh]")}>
      <div className={cn("mx-auto w-full max-w-[1400px] px-3 sm:px-5", pinned && "sticky top-[4.75rem]")}>
        <div
          className={cn(
            "relative flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] px-3 py-8 sm:rounded-[2.25rem] sm:px-8 sm:py-12",
            pinned && "h-[calc(100vh-5.75rem)]",
          )}
        >
          <Backdrop tones={tab.tones} />

          <div role="tablist" aria-label="What Savedly does" className="relative z-10 flex gap-2">
            {TABS.map((t, i) => {
              const selected = i === active;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="hero-scene"
                  onClick={() => choose(i)}
                  className={cn(
                    "group flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    selected
                      ? "bg-card text-foreground shadow-md ring-1 ring-foreground/[0.06]"
                      : "bg-card/55 text-muted-foreground hover:bg-card/85 hover:text-foreground",
                  )}
                >
                  <HugeiconsIcon icon={t.icon} strokeWidth={2} className={cn("h-[18px] w-[18px]", selected && "text-primary")} />
                  <span className={cn(selected ? "inline" : "hidden sm:inline")}>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div
            id="hero-scene"
            role="tabpanel"
            className="relative z-10 mt-5 grid w-full max-w-6xl items-center gap-6 rounded-[1.5rem] bg-card/95 p-5 shadow-xl shadow-primary/10 ring-1 ring-foreground/[0.05] backdrop-blur sm:p-8 md:grid-cols-[1fr_1.15fr] md:gap-12 md:p-10 lg:p-12"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`text-${tab.id}`}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <HugeiconsIcon icon={tab.icon} strokeWidth={2} className="h-4 w-4" />
                  {tab.label}
                </p>
                <h2 className="mt-3 text-[1.75rem] font-medium leading-[1.1] tracking-[-0.03em] text-balance text-foreground sm:text-4xl lg:text-[2.75rem]">
                  {tab.title}
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">{tab.body}</p>
                <Link
                  href={tab.href}
                  className="group mt-6 inline-flex items-center gap-1.5 border-b border-foreground/25 pb-1 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  See how it works
                  <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="relative h-[270px] overflow-hidden rounded-2xl bg-muted/70 ring-1 ring-foreground/[0.04] sm:h-[310px] lg:h-[400px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`scene-${tab.id}`}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Drawn at phone size, enlarged where there is room. */}
                  <div className="h-full w-full lg:h-[80%] lg:w-[80%] lg:origin-top-left lg:scale-125">
                    <Scene />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSwitcher() {
  const cta = useAuthCta();
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 16 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    // z-40 and `isolate`: the fixed navbar lives in here and must stay above
    // anything with a z-index further down the page.
    <section className="relative isolate z-40 bg-background pb-6 font-sans antialiased selection:bg-primary/25">
      <Navbar />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-32 text-center sm:px-8 md:pt-40">
        <motion.div {...rise(0)}>
          <ProductHuntBadge variant="featured" height={40} />
        </motion.div>

        <motion.h1
          {...rise(0.06)}
          className="mt-8 text-[clamp(2.25rem,6vw,4.75rem)] font-medium leading-[1.04] tracking-[-0.04em] text-foreground"
        >
          <span className="block">Save anything.</span>
          <span className="block">Find it when you need it.</span>
        </motion.h1>

        <motion.p {...rise(0.14)} className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          Links, notes, screenshots, PDFs and videos. Savedly reads each one, files it, and finds it again from whatever you remember about it.
        </motion.p>

        <motion.div {...rise(0.22)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={cta.href}
            className="group inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {cta.isAuthenticated ? cta.label : "Start saving free"}
            <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <GithubStarButton variant="hero" label="Explore on GitHub" />
        </motion.div>

        <motion.p {...rise(0.28)} className="mt-5 text-sm text-muted-foreground">
          Free to start. Open source. Self-hostable.
        </motion.p>
      </div>

      <Switcher />
    </section>
  );
}
