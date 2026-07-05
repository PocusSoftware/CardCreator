import { renderDeferralCardPreview } from "@shared/deferralCardRender";
import { resolveDeferralDiscordInvite } from "@shared/deferralCardTypes";
import type { DeferralCardsConfig } from "@shared/deferralCardTypes";
import type { DeferralScenarioId } from "./studioState.svelte";
import { PREVIEW_SAMPLE } from "./studioState.svelte";

export const previewState = $state<{ open: boolean; html: string; scenarioId: string | null }>({
  open: false,
  html: "",
  scenarioId: null,
});

export function openPreview(config: DeferralCardsConfig, scenarioId: string): void {
  const sample = PREVIEW_SAMPLE[scenarioId as DeferralScenarioId] ?? { body: "" };
  const html = renderDeferralCardPreview(
    config,
    {
      scenario: scenarioId,
      body: sample.body,
      requestId: sample.requestId,
      tierName: sample.tierName,
      guildName: "Your Discord",
      discordInvite: resolveDeferralDiscordInvite(config),
      serverName: "Your Server Name",
      playerName: "SniperSpools",
      banExpires: sample.banExpires,
      banReason: sample.banReason,
      banId: sample.banId,
      banDate: sample.banDate,
      assetBaseUrl: null,
    },
  );
  previewState.open = true;
  previewState.html = html;
  previewState.scenarioId = scenarioId;
}

export function closePreview(): void {
  previewState.open = false;
}

export function downloadPublishedCard(): void {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deferral card — ${previewState.scenarioId ?? ""}</title>
<style>body{margin:0;background:#0f1116;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}</style>
</head><body>${previewState.html}</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deferral-card-${previewState.scenarioId ?? "preview"}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
