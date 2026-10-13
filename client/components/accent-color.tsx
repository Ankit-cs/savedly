"use client";

import { useEffect } from "react";
import { useSettingsQuery } from "@/hooks/use-settings-group";
import { ACCENT_STORAGE_KEY, isAccent, type AccentId } from "@/lib/accent";

function apply(accent: AccentId | null) {
  const root = document.documentElement;
  if (accent && accent !== "blue") root.dataset.accent = accent;
  else delete root.dataset.accent;
}

/**
 * Applies the signed-in person's accent colour (Settings > Appearance) to
 * the app. Rendered by the app and admin layouts only, and it takes the
 * colour off again when they unmount, so the public website is always the
 * brand blue. Draws nothing.
 */
export function AccentColor() {
  const { data: settings } = useSettingsQuery();
  const saved = settings?.appearance.accentColor;

  // Before the account's settings arrive: what this device saw last time.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(ACCENT_STORAGE_KEY);
      if (isAccent(cached)) apply(cached);
    } catch {
      // No storage (private mode): the colour arrives with the settings instead.
    }
    return () => apply(null);
  }, []);

  useEffect(() => {
    if (!isAccent(saved)) return;
    apply(saved);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, saved);
    } catch {
      // Not remembered on this device; it still applies for this visit.
    }
  }, [saved]);

  return null;
}
