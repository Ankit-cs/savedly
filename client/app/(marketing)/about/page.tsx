import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { GiftIcon as Gift, SparklesIcon as Sparkles, ServerStack01Icon as Server } from "@hugeicons/core-free-icons";
import { Navbar } from "@/components/marketing/navbar";
import MainFooter from "@/components/marketing/landing/main-footer";
import { LogoMark } from "@/components/logo";
import { GITHUB_URL, LICENSE } from "@/lib/open-source";
import { BOOKING_URL } from "@/lib/booking";
import { SUPPORT_MAILTO } from "@/lib/contact";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About · Savedly",
  description: "Why Savedly exists, what it holds itself to, and how to help shape it. Open source, made in Bhubaneswar.",
  alternates: { canonical: "/about" },
};

// An editorial page: a large serif line, short centred paragraphs, the kinds
// of things people save scattered around one statement, then the ways to
// get involved on a picture. Every claim is something the product does
// today. No numbers, customers, team size or backers are given, because
// none are on record. The scattered pictures are the landing page's demo
// library (public/landing/demo), invented link previews, not real sites.

// Headings are in the serif; everything else in the sans, as on the rest of the site.
const PROSE = "text-lg leading-relaxed text-foreground sm:text-xl";
const UNDERLINE = "underline decoration-foreground/30 decoration-1 underline-offset-[5px] transition-colors hover:decoration-foreground";

/** Two overlapping saved items. `flip` mirrors which one sits in front. */
function Pair({ back, front, flip, className }: { back: string; front: string; flip?: boolean; className?: string }) {
  const tile = "absolute aspect-[40/21] w-[68%] overflow-hidden rounded-[18px] bg-muted shadow-xl shadow-black/10 ring-1 ring-foreground/10 sm:rounded-[22px]";
  return (
    <div aria-hidden className={cn("relative aspect-[16/11] w-full", className)}>
      <div className={cn(tile, "top-0", flip ? "left-0 -rotate-2" : "right-0 rotate-2")}>
        <Image src={`/landing/demo/${back}.webp`} alt="" fill sizes="(min-width: 1024px) 200px, 40vw" className="object-cover" />
      </div>
      <div className={cn(tile, "bottom-0", flip ? "right-0 rotate-1" : "left-0 -rotate-1")}>
        <Image src={`/landing/demo/${front}.webp`} alt="" fill sizes="(min-width: 1024px) 200px, 40vw" className="object-cover" />
      </div>
    </div>
  );
}

const WAYS_IN: { label: string; action: string; href: string; external?: boolean }[] = [
  { label: "Read the code, or star it", action: "GitHub", href: GITHUB_URL, external: true },
  { label: "Run your own copy", action: "Guide", href: "/help/docs/self-host/self-host" },
  { label: "Report something broken", action: "Report", href: "/report" },
  { label: "Suggest a feature", action: "Email", href: SUPPORT_MAILTO, external: true },
  { label: "Talk it through, 30 minutes", action: "Book", href: BOOKING_URL, external: true },
  { label: "Send a pull request", action: "Contribute", href: "/contribute" },
  { label: "See what has shipped", action: "Changelog", href: "/changelog" },
];

const PAID_BY = [
  { icon: Gift, name: "Free", what: "No card needed" },
  { icon: Sparkles, name: "Lite and Pro", what: "Pay for the servers and AI" },
  { icon: Server, name: "Self-hosted", what: "Free, every feature" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <header className="flex min-h-[72svh] flex-col items-center justify-center px-5 pt-28 text-center sm:px-8">
          <h1 className="font-serif text-[clamp(2.75rem,7vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.03em] text-balance text-foreground">
            Saving is easy.
            <br /> Finding it again isn&apos;t.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">Savedly is for the second part.</p>
        </header>

        {/* What it is */}
        <section className="px-5 py-20 sm:px-8 md:py-28">
          <div className={cn("mx-auto max-w-[34rem] space-y-8 text-center text-pretty", PROSE)}>
            <p className="font-medium">Savedly is a memory for what you find online.</p>
            <p className="text-muted-foreground">
              Every link, note, screenshot and file you put in is read, summarised and filed for you. Later you describe it, or ask about it, and get it back, with the saved item there to check.
            </p>
            <p className="text-muted-foreground">
              Bookmarks ask you to organise as you go. Few of us do, and the pile wins. We think the software should do the reading, and you should only have to{" "}
              <Link href="/how-it-works" className={cn("text-foreground", UNDERLINE)}>
                remember roughly what it was
              </Link>
              .
            </p>
          </div>
        </section>

        {/* What people save, around one statement */}
        <section className="px-5 py-16 sm:px-8 md:py-24">
          <div className="relative mx-auto max-w-6xl">
            <div className="mx-auto mb-12 grid max-w-md grid-cols-2 gap-6 lg:hidden">
              <Pair back="calm" front="hnsw" />
              <Pair back="lisbon" front="sourdough" flip />
            </div>

            <div className="hidden lg:block">
              <Pair back="calm" front="hnsw" className="absolute top-0 left-0 w-[18rem]" />
              <Pair back="lisbon" front="q3" flip className="absolute top-0 right-0 w-[18rem]" />
              <Pair back="plaintext" front="nas" flip className="absolute bottom-0 left-[6%] w-[18rem]" />
              <Pair back="sourdough" front="rag" className="absolute right-[6%] bottom-0 w-[18rem]" />
            </div>

            <div className="relative flex flex-col items-center text-center lg:py-56">
              <LogoMark className="h-11 w-11" ticks={false} />
              <p className="mt-7 max-w-[30rem] font-serif text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.15] tracking-[-0.02em] text-balance text-foreground">
                Videos, articles, notes, plans and screenshots. It reads them all.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-md grid-cols-2 gap-6 lg:hidden">
              <Pair back="plaintext" front="nas" flip />
              <Pair back="q3" front="rag" />
            </div>
          </div>
        </section>

        {/* What it holds itself to */}
        <section className="px-5 py-24 sm:px-8 md:py-36">
          <div className={cn("mx-auto max-w-[34rem] space-y-8 text-center text-pretty", PROSE)}>
            <p>
              <span className="font-medium">What you save is yours.</span> <span className="text-muted-foreground">Export all of it, any time, on every plan.</span>
            </p>
            <p>
              <span className="font-medium">Answers come with their sources.</span> <span className="text-muted-foreground">Ask lists the saved items it used, and says so when it can&apos;t find one.</span>
            </p>
            <p>
              <span className="font-medium">Nothing changes behind your back.</span> <span className="text-muted-foreground">Ask waits for your yes before it deletes or edits.</span>
            </p>
            <p>
              <span className="font-medium">And nothing rests on trust.</span>{" "}
              <span className="text-muted-foreground">
                The code is{" "}
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={cn("text-foreground", UNDERLINE)}>
                  open, under {LICENSE}
                </a>
                .
              </span>
            </p>
          </div>
        </section>

        {/* Ways in, on a picture */}
        <section className="px-3 sm:px-5">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#070b14] px-5 py-20 sm:px-8 md:rounded-[2.75rem] md:py-28">
            <Image src="/landing/hero-bg-dark.jpg" alt="" fill sizes="100vw" className="object-cover opacity-90" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#070b14]/40 via-transparent to-[#1447E6]/25" />

            <div className="relative mx-auto max-w-xl text-center">
              <h2 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.025em] text-balance text-white">
                Built in the open.
                <br /> Will you help shape it?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/70">Savedly is new and made in Bhubaneswar. The browser extension is waiting on the Chrome Web Store; the rest is live.</p>

              <ul className="mx-auto mt-10 max-w-md space-y-1.5 text-left">
                {WAYS_IN.map((way) => (
                  <li key={way.label}>
                    <a
                      href={way.href}
                      {...(way.external && !way.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-[14.5px] text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 dark:bg-white/[0.08] dark:text-white dark:ring-1 dark:ring-white/10 dark:backdrop-blur-md dark:hover:bg-white/[0.13]"
                    >
                      {way.label}
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11.5px] font-medium text-neutral-600 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-white/10 dark:text-white/70 dark:group-hover:bg-white dark:group-hover:text-neutral-900">
                        {way.action}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it pays for itself */}
        <section className="px-5 py-24 sm:px-8 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-serif text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.12] tracking-[-0.02em] text-balance text-foreground">Paid for by the people who use it</h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">Not by advertising, and not by selling or training on what you save.</p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {PAID_BY.map((plan) => (
                <div key={plan.name} className="flex items-center gap-3.5 text-left">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-foreground ring-1 ring-foreground/[0.06]">
                    <HugeiconsIcon icon={plan.icon} strokeWidth={1.75} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium leading-tight text-foreground">{plan.name}</span>
                    <span className="block text-[13px] text-muted-foreground">{plan.what}</span>
                  </span>
                </div>
              ))}
            </div>

            <Link href="/pricing" className={cn("mt-10 inline-block text-sm font-medium text-foreground", UNDERLINE)}>
              See the plans
            </Link>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
