import Link from "next/link";

// Everything the product does that the sections above don't show, as a plain
// list: a reader scanning for one thing ("can I share it?", "does it work on
// my phone?") finds it here. Each line is something in the app today; what is
// only planned (the browser extension, voice transcription) is left out, and
// anything tied to a paid plan says so.

const GROUPS: { title: string; href: string; items: string[] }[] = [
  {
    title: "Save",
    href: "/help/docs/get-started/capture",
    items: [
      "Links, with the page read and summarized",
      "Notes, kept exactly as you typed them",
      "Images and screenshots, with their text read",
      "PDFs and documents",
      "Videos and voice memos",
      "Share to Savedly from other apps on your phone",
    ],
  },
  {
    title: "Share",
    href: "/help/docs/share/share",
    items: [
      "A public link to a memory or a whole collection",
      "Password-protected links (Lite and Pro)",
      "Invite people by email, or let them request access (Pro)",
      "Daily view counts on shared links (Lite and Pro)",
      "Stop sharing at any time",
    ],
  },
  {
    title: "Plan",
    href: "/help/docs/stay/calendar",
    items: [
      "A calendar of the dates found in what you save",
      "Google Calendar sync",
      "Add or move an event by asking",
      "Notifications when a date or a duplicate turns up",
    ],
  },
  {
    title: "Look back",
    href: "/help/docs/find/explore",
    items: [
      "Explore: something you saved and forgot, picked for you",
      "A graph of how your memories connect",
      "Insights into what you save, and when",
      "Favorites, Archive, and a Trash that waits 15 days",
    ],
  },
  {
    title: "Everyday",
    href: "/help/docs/account/shortcuts",
    items: [
      "Install it on your phone, no app store needed",
      "A command palette and keyboard shortcuts",
      "Light and dark themes, and an accent color",
      "Bulk actions on many memories at once (Lite and Pro)",
    ],
  },
  {
    title: "On your own terms",
    href: "/help/docs/self-host/self-host",
    items: [
      "Self-host with one command",
      "Bring your own AI key: OpenAI, Anthropic, Gemini, Groq, OpenRouter",
      "Backups and update notices in the admin area",
      "Open source under AGPL-3.0",
    ],
  },
];

export function MoreSection() {
  return (
    <section id="everything" className="scroll-mt-24 bg-background px-5 py-20 font-sans antialiased sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-balance text-foreground">Everything else it does</h2>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
            Search, Ask and filing are the heart of it. This is the rest, in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-x-12 border-t border-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title} className="border-b border-foreground/15 py-8">
              <h3 className="text-lg font-medium tracking-[-0.01em] text-foreground">
                <Link href={group.href} className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  {group.title}
                </Link>
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="text-base leading-snug text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
