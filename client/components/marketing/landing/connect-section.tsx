"use client";

import { useRef, useState, useSyncExternalStore, type RefObject } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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

// What Savedly connects to, as a board of tiles seen at an angle with Savedly
// in the middle. Three kinds, and the board says which is which rather than
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

// What works sits next to Savedly; what's planned is out at the edges.
const ROWS: (Tile | "savedly")[][] = [
  [T.notion, T.googleCalendar, T.github, T.reddit],
  [T.youtube, T.openai, "savedly", T.claude, T.telegram],
  [T.slack, T.gemini, T.raindrop, T.whatsapp],
];

const KIND_LABEL: Record<Kind, string> = { live: "connects today", ai: "bring your own key", planned: "planned" };

const FINE_POINTER = "(pointer: fine)";
function subscribeToPointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
/** A mouse or trackpad. On a touch screen a finger on a tile has to stay free to scroll the page. */
function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeToPointer, () => window.matchMedia(FINE_POINTER).matches, () => false);
}

/** What every tile shares: with a mouse, it can be picked up and left anywhere on the board. */
function useDraggable(board: RefObject<HTMLDivElement | null>, onDragging: (dragging: boolean) => void) {
  const fine = useFinePointer();
  return {
    drag: fine,
    dragConstraints: board,
    dragElastic: 0.12,
    dragMomentum: false,
    whileHover: { scale: 1.06 },
    whileDrag: { scale: 1.14, zIndex: 20, cursor: "grabbing" },
    onDragStart: () => onDragging(true),
    onDragEnd: () => onDragging(false),
  } as const;
}

interface TileProps {
  board: RefObject<HTMLDivElement | null>;
  onDragging: (dragging: boolean) => void;
}

function BrandTile({ tile, board, onDragging }: { tile: Tile } & TileProps) {
  const planned = tile.kind === "planned";
  return (
    <motion.li
      {...useDraggable(board, onDragging)}
      title={`${tile.name}: ${KIND_LABEL[tile.kind]}`}
      className={cn(
        "flex h-[76px] w-[84px] [@media(pointer:fine)]:cursor-grab items-center justify-center rounded-2xl ring-1 sm:h-[108px] sm:w-[120px] sm:rounded-3xl",
        planned ? "bg-foreground/[0.02] ring-foreground/[0.06]" : "bg-card shadow-sm ring-foreground/10",
      )}
    >
      <HugeiconsIcon icon={tile.icon} strokeWidth={1.75} className={cn("pointer-events-none h-8 w-8 sm:h-11 sm:w-11", tile.tint, planned && "opacity-40 grayscale-[35%]")} />
      <span className="sr-only">
        {tile.name}, {KIND_LABEL[tile.kind]}
      </span>
    </motion.li>
  );
}

function SavedlyTile({ board, onDragging }: TileProps) {
  return (
    <motion.li
      {...useDraggable(board, onDragging)}
      // Raised off the board, toward the viewer.
      style={{ z: 34, scale: 1.12 }}
      whileHover={{ scale: 1.17 }}
      className="flex h-[76px] w-[84px] [@media(pointer:fine)]:cursor-grab items-center justify-center rounded-2xl bg-card shadow-2xl shadow-primary/25 ring-1 ring-primary/40 sm:h-[108px] sm:w-[120px] sm:rounded-3xl"
    >
      <LogoMark ticks={false} className="pointer-events-none h-10 w-10 sm:h-14 sm:w-14" />
      <span className="sr-only">Savedly</span>
    </motion.li>
  );
}

function Board() {
  const board = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Straight while the pointer is over it, and for as long as a tile is held:
  // a drag can carry the pointer off the board, and it mustn't tip mid-move.
  const straight = hovered || dragging;
  return (
    <div
      ref={board}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="relative mx-auto h-[250px] w-full max-w-[860px] select-none sm:h-[380px]"
      style={{ perspective: "1400px" }}
    >
      {/* The plane the tiles lie on: tipped back, fading out at its edges.
          Under the pointer it stands up to face you. */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex flex-col items-center gap-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:gap-6",
          straight ? "[transform:rotateX(0deg)]" : "[transform:rotateX(44deg)]",
        )}
        style={{
          transformStyle: "preserve-3d",
          maskImage: "radial-gradient(ellipse 62% 78% at 50% 48%, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 78% at 50% 48%, #000 55%, transparent 100%)",
        }}
      >
        {/* A field of dots under the middle of the board. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-foreground/25"
          style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1.4px)", backgroundSize: "14px 14px", maskImage: "radial-gradient(closest-side, #000, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000, transparent)" }}
        />
        {ROWS.map((row, r) => (
          <ul key={r} className="relative flex gap-3 sm:gap-7" style={{ transformStyle: "preserve-3d" }}>
            {row.map((tile) =>
              tile === "savedly" ? (
                <SavedlyTile key="savedly" board={board} onDragging={setDragging} />
              ) : (
                <BrandTile key={tile.name} tile={tile} board={board} onDragging={setDragging} />
              ),
            )}
          </ul>
        ))}
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

          <p className="mt-6 text-xs text-muted-foreground">The brighter tiles work today. The fainter ones are planned.<span className="hidden [@media(pointer:fine)]:inline"> Go on, move them around.</span></p>
        </div>
      </div>
    </section>
  );
}
