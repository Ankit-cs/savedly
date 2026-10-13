// The accent colours someone can pick in Settings > Appearance. Blue is the
// brand colour and the default; the others recolour the app's accent for that
// person only. The values themselves are in app/globals.css, keyed by the
// `data-accent` attribute that components/accent-color.tsx puts on <html>.

export const ACCENTS = [
  { id: "blue", label: "Blue", swatch: "oklch(0.4878 0.2432 264.4045)" },
  { id: "purple", label: "Purple", swatch: "oklch(0.5 0.25 300)" },
  { id: "green", label: "Green", swatch: "oklch(0.5 0.12 165)" },
  { id: "orange", label: "Orange", swatch: "oklch(0.55 0.19 40)" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

/** Where the last known choice is kept on this device, so it shows before the account's settings have loaded. */
export const ACCENT_STORAGE_KEY = "savedly:accent";

export const isAccent = (value: unknown): value is AccentId => ACCENTS.some((accent) => accent.id === value);
