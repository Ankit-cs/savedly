import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import MainFooter from "@/components/marketing/landing/main-footer";
import { FinalCtaSection } from "@/components/marketing/landing/final-cta-section";
import { GITHUB_URL, LICENSE } from "@/lib/open-source";
import { BOOKING_URL } from "@/lib/booking";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const metadata: Metadata = {
  title: "About · Savedly",
  description: "Why Savedly exists, what it holds itself to, how it pays for itself, and who to talk to. Open source, made in Bengaluru.",
  alternates: { canonical: "/about" },
};

// Why the product exists and what it holds itself to. Every claim here is
// something the product does today (export, cited answers, Ask's
// confirmation step, the AGPL code); the extension is still waiting for the
// Chrome Web Store and is said to be. No numbers, customers or team size are
// given, because none are on record.

const H2 = "font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-balance text-foreground";
const LINK = "inline-flex border-b border-foreground/25 pb-0.5 text-sm font-medium text-foreground transition-colors hover:border-foreground";

const BELIEFS: { title: string; body: string }[] = [
  {
    title: "What you save is yours",
    body: "Export a complete copy of everything, at any time, on every plan. Delete your account and it goes with it. A plan running out never locks you out of what you already saved.",
  },
  {
    title: "Answers you can check",
    body: "When Ask answers, it lists the saved items it used. If it can't find the answer in your library, it says so instead of making one up.",
  },
  {
    title: "Nothing changes behind your back",
    body: "Ask can organise your library for you, but before it deletes, edits several things at once, or touches your calendar, it says what it's about to do and waits for your yes.",
  },
  {
    title: "Open, so nothing rests on trust",
    body: `Every line of the code is public under ${LICENSE}. Read how it handles your data, or run your own copy on your own server, with every feature.`,
  },
];

const PAID_BY: { name: string; what: string }[] = [
  { name: "Free", what: "The hosted service, with room to save and ask every month. No card needed." },
  { name: "Lite and Pro", what: "More room, more AI each month, and a few extras. These pay for the servers and the AI." },
  { name: "Self-hosted", what: "Free, with every feature and no limits. You bring the server and the AI key." },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
      <Navbar />

      <main className="flex-1">
        <header className="px-5 pt-36 sm:px-8 md:pt-44">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.03em] text-balance text-foreground">
              Saving is easy.
              <br className="hidden sm:block" /> Finding it again isn&apos;t.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground lg:justify-self-end">
              Savedly is a memory for what you find online. Put in a link, a note, a screenshot or a file, and find it later by describing it, or ask about it in plain words.
            </p>
          </div>
        </header>

        {/* 1. Why it exists */}
        <section id="why" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
            <h2 className={H2}>Why it exists</h2>
            <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-pretty text-muted-foreground">
              <p>
                Most of us keep things the same way: a bookmark, a screenshot, a note to self, a tab left open for later. Each one felt worth keeping. Weeks on, it&apos;s somewhere in a folder you&apos;ll never open, under
                a name you don&apos;t remember.
              </p>
              <p>
                Bookmark managers ask you to file things as you save them, in folders and tags you have to keep up. Few people do, and the pile wins. The problem was never saving. It&apos;s that nothing reads what you
                saved, so finding it depends on remembering exactly where it went.
              </p>
              <p className="text-foreground">
                Savedly does the reading. Each thing you save is summarised, tagged and filed for you, so you can come back with a rough description, or a question, and get it back.
              </p>
            </div>
          </div>
        </section>

        {/* 2. What it holds itself to */}
        <section id="beliefs" className="scroll-mt-24 px-3 py-10 sm:px-5 md:py-16">
          <div className="mx-auto max-w-[1400px] rounded-[2rem] bg-muted/60 px-5 py-16 sm:px-8 md:rounded-[2.5rem] md:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className={H2}>What it holds itself to</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Four things, each one something the product does today, not a promise about later.</p>

              <div className="mt-12 grid gap-3 sm:grid-cols-2">
                {BELIEFS.map((item, i) => (
                  <div key={item.title} className="rounded-2xl bg-card p-6 ring-1 ring-foreground/[0.07] sm:p-7">
                    <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                    <h3 className="mt-3 text-lg font-medium tracking-[-0.01em] text-foreground">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. How it pays for itself */}
        <section id="paid-for" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
            <div className="max-w-md">
              <h2 className={H2}>How it pays for itself</h2>
              <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
                By people who choose a paid plan on the hosted service. Not by advertising, and not by selling or training on what you save.
              </p>
              <Link href="/pricing" className={`mt-7 ${LINK}`}>
                See the plans
              </Link>
            </div>

            <dl className="border-t border-foreground/15">
              {PAID_BY.map((item) => (
                <div key={item.name} className="border-b border-foreground/15 py-6">
                  <dt className="text-lg font-medium tracking-[-0.01em] text-foreground">{item.name}</dt>
                  <dd className="mt-1.5 max-w-lg text-base leading-relaxed text-muted-foreground">{item.what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 4. Where it stands, and who to talk to */}
        <section id="now" className="scroll-mt-24 px-5 pb-20 sm:px-8 md:pb-28">
          <div className="mx-auto max-w-6xl border-t border-foreground/15 pt-20 md:pt-28">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <div>
                <h2 className={H2}>Where it stands</h2>
                <div className="mt-5 max-w-xl space-y-5 text-lg leading-relaxed text-pretty text-muted-foreground">
                  <p>
                    Savedly is new, made in Bengaluru, and built in the open. Everything that has shipped is on the changelog, with the date it went out. The browser extension is built and waiting for the Chrome Web
                    Store to approve it.
                  </p>
                  <p>Ideas, bug reports and code are all welcome. The fastest way to shape what comes next is to tell us what you&apos;d use.</p>
                </div>
                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                  <Link href="/changelog" className={LINK}>
                    Read the changelog
                  </Link>
                  <Link href="/contribute" className={LINK}>
                    Contribute
                  </Link>
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                    The code on GitHub
                  </a>
                </div>
              </div>

              <div className="self-center rounded-3xl bg-card p-6 ring-1 ring-foreground/[0.07] sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Talk to us</p>
                <ul className="mt-4 divide-y divide-foreground/10">
                  <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3.5 first:pt-0">
                    <span className="text-[15px] text-muted-foreground">Email</span>
                    <a href={SUPPORT_MAILTO} className="text-[15px] font-medium text-foreground transition-colors hover:text-primary">
                      {SUPPORT_EMAIL}
                    </a>
                  </li>
                  <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3.5">
                    <span className="text-[15px] text-muted-foreground">A 30-minute call</span>
                    <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium text-foreground transition-colors hover:text-primary">
                      Pick a time
                    </a>
                  </li>
                  <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3.5 last:pb-0">
                    <span className="text-[15px] text-muted-foreground">Something broken</span>
                    <Link href="/report" className="text-[15px] font-medium text-foreground transition-colors hover:text-primary">
                      Report a problem
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <FinalCtaSection />
      </main>

      <MainFooter />
    </div>
  );
}
