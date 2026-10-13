// Makes freshly installed Arc components fit this app. Run with `pnpm arc:adapt`
// after every `shadcn add @uiarc/...`; it is safe to run again and again.
//
// Arc's components use three CSS variable names that mean something else
// here (see foundation.css). This renames them inside components/arc only.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const RENAMES = [
  [/--accent-foreground(?![\w-])/g, "--arc-accent-foreground"],
  [/--accent(?![\w-])/g, "--arc-accent"],
  [/--text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)(?![\w-])/g, "--arc-text-$1"],
];
// This app's own files in the folder: never rewritten.
const SKIP = new Set(["foundation.css", "adapt.mjs"]);

let changed = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(css|tsx?)$/.test(name) && !SKIP.has(name)) {
      const before = readFileSync(path, "utf8");
      const after = RENAMES.reduce((text, [from, to]) => text.replace(from, to), before);
      if (after !== before) {
        writeFileSync(path, after);
        changed++;
        console.log("adapted", path.slice(root.length + 1));
      }
    }
  }
};
walk(root);
console.log(changed ? `${changed} file(s) adapted.` : "Nothing to adapt.");
