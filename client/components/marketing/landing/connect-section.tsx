"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight01Icon as ArrowRightIcon,
  Bookmark02Icon,
  Calendar03Icon,
  ChatGptIcon,
  ClaudeIcon,
  GithubIcon,
  GoogleGeminiIcon,
  Notion01Icon,
  RedditIcon,
  SlackIcon,
  TelegramIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import { LogoMark } from "@/components/logo";
import { useAuthCta } from "@/hooks/use-auth-cta";
import { cn } from "@/lib/utils";

// What Savedly connects to, as a board of tiles seen at an angle, sliding
// past in rows with Savedly fixed in the middle. Three kinds, and the board says which is which rather than
// passing them all off as working:
//   - connected today (Google Calendar, GitHub stars);
//   - AI providers whose key you can bring;
//   - connectors that are planned, drawn fainter (the same list the app's
//     own Integrations page marks as planned).

type Kind = "live" | "ai" | "planned";

interface Tile {
  name: string;
  icon: IconSvgElement;
  kind: Kind;
  /** The brand's own color, as an icon tint. */
  tint: string;
}

const T = {
  googleCalendar: { name: "Google Calendar", icon: Calendar03Icon, kind: "live", tint: "text-[#4285F4]" },
  github: { name: "GitHub stars", icon: GithubIcon, kind: "live", tint: "text-foreground" },
  openai: { name: "OpenAI", icon: ChatGptIcon, kind: "ai", tint: "text-foreground" },
  claude: { name: "Anthropic Claude", icon: ClaudeIcon, kind: "ai", tint: "text-[#D97757]" },
  gemini: { name: "Google Gemini", icon: GoogleGeminiIcon, kind: "ai", tint: "text-[#4E8CF7]" },
  notion: { name: "Notion", icon: Notion01Icon, kind: "planned", tint: "text-foreground" },
  raindrop: { name: "Raindrop.io", icon: Bookmark02Icon, kind: "planned", tint: "text-[#1A9FFF]" },
  reddit: { name: "Reddit", icon: RedditIcon, kind: "planned", tint: "text-[#FF4500]" },
  youtube: { name: "YouTube", icon: YoutubeIcon, kind: "planned", tint: "text-[#FF0033]" },
  telegram: { name: "Telegram", icon: TelegramIcon, kind: "planned", tint: "text-[#26A5E4]" },
  slack: { name: "Slack", icon: SlackIcon, kind: "planned", tint: "text-[#B46BD6]" },
  whatsapp: { name: "WhatsApp", icon: WhatsappIcon, kind: "planned", tint: "text-[#25D366]" },
} satisfies Record<string, Tile>;

// Three rows that slide past, the middle one the other way. Each row has both
// kinds of tile, so what works today is always somewhere on screen.
const ROWS: Tile[][] = [
  [T.googleCalendar, T.notion, T.github, T.reddit, T.openai, T.youtube],
  [T.claude, T.telegram, T.gemini, T.slack, T.googleCalendar, T.raindrop],
  [T.github, T.whatsapp, T.openai, T.notion, T.gemini, T.reddit],
];
/** Seconds for a row to travel its own length. Slightly different, so the rows never line up the same way twice. */
const ROW_SECONDS = [46, 54, 50];

const KIND_LABEL: Record<Kind, string> = { live: "connects today", ai: "bring your own key", planned: "planned" };

function BrandTile({ tile, hidden }: { tile: Tile; hidden?: boolean }) {
  const planned = tile.kind === "planned";
  return (
    <li
      aria-hidden={hidden}
      title={`${tile.name}: ${KIND_LABEL[tile.kind]}`}
      className={cn(
        "flex h-[76px] w-[84px] shrink-0 items-center justify-center rounded-2xl ring-1 sm:h-[108px] sm:w-[120px] sm:rounded-3xl",
        planned ? "bg-foreground/[0.02] ring-foreground/[0.06]" : "bg-card shadow-sm ring-foreground/10",
      )}
    >
      <HugeiconsIcon icon={tile.icon} strokeWidth={1.75} className={cn("h-8 w-8 sm:h-11 sm:w-11", tile.tint, planned && "opacity-40 grayscale-[35%]")} />
      {!hidden && (
        <span className="sr-only">
          {tile.name}, {KIND_LABEL[tile.kind]}
        </span>
      )}
    </li>
  );
}

/** One row, written out twice end to end so it can loop without a seam. */
function MarqueeRow({ tiles, seconds, reverse }: { tiles: Tile[]; seconds: number; reverse?: boolean }) {
  return (
    <div className="flex w-max">
      <ul
        className="connect-marquee flex shrink-0 gap-3 pr-3 sm:gap-7 sm:pr-7"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {tiles.map((tile, i) => (
          <BrandTile key={`${tile.name}-${i}`} tile={tile} />
        ))}
      </ul>
      <ul
        aria-hidden
        className="connect-marquee flex shrink-0 gap-3 pr-3 sm:gap-7 sm:pr-7"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {tiles.map((tile, i) => (
          <BrandTile key={`${tile.name}-${i}`} tile={tile} hidden />
        ))}
      </ul>
    </div>
  );
}

function Board() {
  return (
    <div className="group relative mx-auto h-[250px] w-full max-w-[860px] select-none sm:h-[380px]" style={{ perspective: "1400px" }}>
      {/* Each list slides left by its own width, then starts again: its twin
          has taken its place by then, so the row never jumps. Under the
          pointer the rows stop, so a tile can be read. */}
      <style>{`
        @keyframes connect-marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        .connect-marquee { animation: connect-marquee linear infinite; }
        .group:hover .connect-marquee { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .connect-marquee { animation: none; } }
      `}</style>

      {/* The plane the tiles lie on: tipped back, fading out at its edges.
          Under the pointer it stands up to face you. */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col gap-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:rotateX(44deg)] group-hover:[transform:rotateX(0deg)] motion-reduce:transition-none sm:gap-6"
        style={{
          transformStyle: "preserve-3d",
          maskImage: "radial-gradient(ellipse 62% 78% at 50% 48%, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 78% at 50% 48%, #000 55%, transparent 100%)",
        }}
      >
        {ROWS.map((row, r) => (
          <MarqueeRow key={r} tiles={row} seconds={ROW_SECONDS[r]} reverse={r % 2 === 1} />
        ))}

        {/* Savedly stays put in the middle, raised off the board, while the rest goes by underneath. */}
        <div
          className="absolute left-1/2 top-1/2 flex h-[88px] w-[96px] items-center justify-center rounded-2xl bg-card shadow-2xl shadow-primary/30 ring-1 ring-primary/40 sm:h-[124px] sm:w-[136px] sm:rounded-3xl"
          style={{ transform: "translate(-50%, -50%) translateZ(40px)" }}
        >
          <LogoMark ticks={false} className="h-11 w-11 sm:h-16 sm:w-16" />
          <span className="sr-only">Savedly</span>
        </div>
      </div>
    </div>
  );
}

export function ConnectSection() {
  const cta = useAuthCta();
  return (
    <section id="integrations" className="scroll-mt-24 overflow-hidden bg-background px-5 py-20 font-sans antialiased sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Board />

        <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8">
          <h2 className="font-serif text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.025em] text-balance text-foreground">
            Works with the tools
            <br className="hidden sm:block" /> you already use
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Google Calendar and GitHub connect today. Bring your own key from OpenAI, Anthropic or Google if you&apos;d rather run the AI yourself. More connectors are on the way.
          </p>

          <Link
            href={cta.href}
            className="group mt-8 inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-6 text-[15px] font-medium text-foreground ring-1 ring-foreground/15 transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {cta.isAuthenticated ? cta.label : "Get started"}
            <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <p className="mt-6 text-xs text-muted-foreground">The brighter tiles work today. The fainter ones are planned.</p>
        </div>
      </div>
    </section>
  );
}
