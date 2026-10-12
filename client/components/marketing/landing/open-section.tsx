"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon as ArrowRightIcon, Copy01Icon as CopyIcon, Tick02Icon as TickIcon } from "@hugeicons/core-free-icons";
import { GithubStarButton, useStarCount } from "@/components/marketing/github-star-button";
import { INSTALL_COMMAND, LICENSE } from "@/lib/open-source";

// Built in the open: Savedly is open source and you can run your own copy.
// Three numbered steps beside the real app, with the install command on a
// card you can copy from. Everything stated here is checkable: the licence,
// the command (install.sh in the repository) and the live star count.

const STEPS = [
  "Run one command on any machine with Docker",
  "Open it in your browser and create your admin account",
  "Add your own AI key, and every feature is yours",
];

function InstallCard() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // No clipboard access (an old browser, or an insecure page): the command is on screen to select by hand.
    }
  }
  return (
    <div className="w-full max-w-[420px] rounded-3xl bg-card p-6 shadow-2xl shadow-black/10 ring-1 ring-foreground/[0.07] sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Install</p>
      <p className="mt-3 break-all font-mono text-[12.5px] leading-relaxed text-muted-foreground select-all">
        <span className="text-primary">$</span> {INSTALL_COMMAND}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <HugeiconsIcon icon={copied ? TickIcon : CopyIcon} strokeWidth={2} className="h-[18px] w-[18px]" />
        <span aria-live="polite">{copied ? "Copied" : "Copy command"}</span>
      </button>
    </div>
  );
}

export function OpenSection() {
  const stars = useStarCount();
  return (
    <section id="open-source" className="scroll-mt-24 bg-background px-5 font-sans antialiased sm:px-8">
      <div className="mx-auto max-w-6xl border-y border-foreground/15 py-20 md:py-28">
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-balance text-foreground">
          Open source. Run it yourself in minutes.
        </h2>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-10">
          <div className="flex flex-col">
            <ol>
              {STEPS.map((step, i) => (
                <li key={step} className="border-b border-foreground/15 py-6 first:pt-0 last:border-b-0">
                  <span className="block font-serif text-4xl font-medium leading-none tracking-[-0.02em] text-foreground">{i + 1}.</span>
                  <span className="mt-2.5 block max-w-[19rem] text-[15px] leading-relaxed text-foreground">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 lg:mt-auto lg:pt-10">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/help/docs/self-host/self-host"
                  className="group inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Read the guide
                  <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <GithubStarButton variant="hero" label="Star on GitHub" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {LICENSE} licensed. Free to self-host, with every feature{stars ? `. ${stars.toLocaleString()} ${stars === 1 ? "star" : "stars"} on GitHub` : ""}.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-muted/70 sm:rounded-[2.5rem]">
            {/* The real app, set into the panel's corner. */}
            <div className="relative ml-[9%] mt-[8%] aspect-[1440/900] w-[105%] overflow-hidden rounded-tl-2xl bg-background shadow-xl ring-1 ring-foreground/[0.07]">
              <Image src="/landing/app-home-light.webp" alt="The Savedly home screen: a search box, quick actions and recently saved items." fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover object-left-top dark:hidden" />
              <Image src="/landing/app-home-dark.webp" alt="" aria-hidden fill sizes="(min-width: 1024px) 760px, 100vw" className="hidden object-cover object-left-top dark:block" />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex justify-end sm:inset-x-auto sm:bottom-8 sm:right-8">
              <InstallCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
