import { db } from "./index";
import { whatsNewItems } from "./schema";
import { WhatsNewKind } from "./enums";
import { cacheRedis, redis } from "../config/redis";
import { bumpPublicCache } from "../shared/cache/response-cache";

// The launch tour: the cards the landing page's popup shows a first-time
// visitor. At launch everything is new, so these introduce what the product
// does instead of announcing changes.
//
//   pnpm db:feature-tour
//
// REPLACES every existing "What's new" card. Afterwards the cards are
// ordinary rows: edit, reorder or switch them off under Admin > What's new.
// Pictures are files of the website (client/public), so they need no upload.

const CARDS = [
  {
    title: "Save anything, in one place",
    body: "Links, notes, videos, screenshots and files all go into the same box. Paste it in and carry on with your day.",
    bullets: ["Savedly reads it and writes a short summary", "Tags and a collection are suggested for you", "It tells you when you have already saved something"],
    imageUrl: "/whats-new/share.webp",
    ctaLabel: "Save something",
    ctaUrl: "/app/capture",
  },
  {
    title: "Find it by describing it",
    body: "You rarely remember the exact words. Search matches what a thing is about, so a rough description is enough.",
    bullets: ["Type it the way you remember it", "Narrow down to websites, notes, videos, images or files", "Exact names and numbers still find it"],
    imageUrl: "/landing/app-search-light.webp",
    ctaLabel: "Try a search",
    ctaUrl: "/app/search",
  },
  {
    title: "Ask, and see where the answer came from",
    body: "Ask Savedly answers from what you have saved, and lists the saved items it used so you can check it.",
    bullets: ["Answers come from your own library", "It can save, tag and organise things for you", "It asks before it changes or removes anything"],
    imageUrl: "/landing/app-ask-light.webp",
    ctaLabel: "Ask something",
    ctaUrl: "/app/ask",
  },
  {
    title: "On your phone, like an app",
    body: "Add Savedly to your home screen and it opens straight to your library. No app store needed.",
    bullets: ["Works on Android and iPhone", "On Android, share to Savedly from any app", "The same library everywhere you sign in"],
    imageUrl: "/whats-new/install.webp",
    ctaLabel: "Open Savedly",
    ctaUrl: "/app",
  },
  {
    title: "Private, and yours to run",
    body: "Keep some things behind a PIN, and read the code that handles all of it. Savedly is free and open source.",
    bullets: ["Vault items stay out of search, the graph and sharing until you enter your PIN", "Export everything you have saved at any time", "Run it on your own server with your own keys"],
    imageUrl: "/help/docs/vault.png",
    ctaLabel: "How it works",
    ctaUrl: "/how-it-works",
  },
];

(async () => {
  const removed = await db.transaction(async (tx) => {
    const old = await tx.delete(whatsNewItems).returning({ id: whatsNewItems.id });
    await tx.insert(whatsNewItems).values(CARDS.map((card, sortOrder) => ({ ...card, kind: WhatsNewKind.FEATURE, isActive: true, sortOrder })));
    return old.length;
  });
  // The landing page reads the cards through the shared public cache.
  await bumpPublicCache();
  console.log(`Replaced ${removed} card(s) with the ${CARDS.length}-card feature tour.`);
})()
  .catch((err) => {
    console.error("Couldn't write the feature tour:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => {
    cacheRedis.disconnect();
    redis.disconnect();
    process.exit();
  });
