import type { DeferralCardsConfig } from "@shared/deferralCardTypes";
import { normalizeDeferralCardsConfig, DEFAULT_DEFERRAL_CARD_TEMPLATES } from "@shared/deferralCardTypes";

const STORAGE_KEY = "card.deferralCards";

export function loadStoredDeferralCards(): DeferralCardsConfig {
  if (typeof window === "undefined") return seedConfig();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedConfig();
    return normalizeDeferralCardsConfig(JSON.parse(raw));
  } catch {
    return seedConfig();
  }
}

function seedConfig(): DeferralCardsConfig {
  return normalizeDeferralCardsConfig({
    scenarios: structuredClone(DEFAULT_DEFERRAL_CARD_TEMPLATES),
  } as Partial<DeferralCardsConfig>);
}

export function persistDeferralCards(config: DeferralCardsConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
  }
}

export function downloadJson(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
