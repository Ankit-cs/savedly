"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon as ArrowRightIcon } from "@hugeicons/core-free-icons";
import { formatPriceMinor, listPublicPlans, planTier, PLAN_TIER_TAGLINE, type PublicPlan } from "@/lib/plans";

// The plans at a glance, before someone goes looking for the pricing page.
// Names, prices and descriptions come from the server (GET /plans), the same
// source as /pricing, so this can't advertise a price that doesn't exist. If
// the request fails, the section still stands, without prices.

interface Column {
  key: string;
  name: string;
  price: string | null;
  per: string | null;
  line: string;
}

const SELF_HOSTED: Column = {
  key: "self-hosted",
  name: "Self-hosted",
  price: "Free",
  per: null,
  line: "Every feature and no limits, on your own machine with your own AI key.",
};

/** One column per tier, from its monthly plan. */
function columns(plans: PublicPlan[] | undefined): Column[] {
  const monthly = (plans ?? []).filter((p) => p.isDefault || p.billingInterval === "monthly").sort((a, b) => a.sortOrder - b.sortOrder);
  const hosted = monthly.map((plan) => ({
    key: plan.key,
    name: plan.name,
    price: plan.isDefault ? "Free" : plan.priceMinor > 0 ? formatPriceMinor(plan.priceMinor, plan.currency) : null,
    per: plan.isDefault || plan.priceMinor <= 0 ? null : "a month",
    line: PLAN_TIER_TAGLINE[planTier(plan.key)] ?? plan.description ?? "",
  }));
  return [...hosted, SELF_HOSTED];
}

export function PricingStrip() {
  const { data: plans, isLoading, isError } = useQuery({ queryKey: ["plans", "public"], queryFn: listPublicPlans });
  const cols = isLoading ? null : columns(isError ? [] : plans);

  return (
    <section id="pricing" className="scroll-mt-24 bg-background px-5 py-20 font-sans antialiased sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-balance text-foreground">What it costs</h2>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
              Start free, with no card. On every hosted plan we supply the AI, so there are no keys to set up.
            </p>
          </div>
          <Link
            href="/pricing"
            className="group inline-flex w-fit shrink-0 items-center gap-1.5 border-b border-foreground/25 pb-0.5 text-sm font-medium text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Compare plans in full
            <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid border-t border-foreground/15 sm:grid-cols-2 lg:grid-cols-4" aria-busy={!cols}>
          {(cols ?? Array.from({ length: 4 }, () => null)).map((col, i) => (
            <div
              key={col?.key ?? i}
              className="border-b border-foreground/15 py-8 sm:px-6 sm:[&:nth-child(odd)]:pl-0 lg:border-l lg:border-b-0 lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:[&:nth-child(odd)]:pl-7 lg:first:[&:nth-child(odd)]:pl-0"
            >
              {col ? (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground">{col.name}</h3>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-serif text-4xl font-medium tracking-[-0.02em] text-foreground">{col.price ?? "Soon"}</span>
                    {col.per && <span className="text-sm text-muted-foreground">{col.per}</span>}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">{col.line}</p>
                </>
              ) : (
                <div className="space-y-4" aria-hidden>
                  <div className="h-4 w-16 rounded bg-foreground/[0.07]" />
                  <div className="h-9 w-24 rounded bg-foreground/[0.07]" />
                  <div className="h-4 w-full rounded bg-foreground/[0.07]" />
                  <div className="h-4 w-2/3 rounded bg-foreground/[0.07]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
