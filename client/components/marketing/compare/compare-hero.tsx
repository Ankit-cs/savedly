"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText);

/**
 * The comparison pages' opening: a large line whose words rise in from under
 * each line (GSAP), then whatever follows it fading up. Hidden until GSAP
 * has split the words so they don't flash in place first; shown at once for
 * reduced motion, or with no script.
 */
export function CompareHero({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const hero = root.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(hero, { autoAlpha: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(hero, { autoAlpha: 1 });
        SplitText.create(hero.querySelector("h1"), {
          type: "words,lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap
              .timeline()
              .from(self.words, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.07 })
              .from(hero.querySelectorAll("[data-hero-after]"), { autoAlpha: 0, y: 14, duration: 0.9, ease: "power3.out", stagger: 0.1 }, "-=0.6"),
        });
      });
    },
    { scope: root },
  );

  return (
    <>
      <noscript>
        <style>{"[data-compare-hero]{visibility:visible!important}"}</style>
      </noscript>
      <header ref={root} data-compare-hero className={className ?? "invisible px-5 pt-40 pb-12 text-center sm:px-8 md:pt-48"}>
        <h1 className="text-[clamp(2.75rem,7vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.045em] text-balance text-foreground">{title}</h1>
        {children}
      </header>
    </>
  );
}
