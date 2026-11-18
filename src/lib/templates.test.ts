import { describe, expect, test } from "bun:test";
import {
  DEFERRAL_CARD_HEIGHT_MAX,
  DEFERRAL_CARD_HEIGHT_MIN,
  DEFERRAL_CARD_PADDING,
  DEFERRAL_CARD_WIDTH_MAX,
  DEFERRAL_CARD_WIDTH_MIN,
  getCanvasContentWidth,
  getTemplateCanvas,
  normalizeCanvasElements,
  templateWithCanvas,
} from "@shared/deferralCardCanvas";
import { exportDeferralScenario, importDeferralCardFile } from "@shared/deferralCardExport";
import { patchDeferralScenario } from "@shared/deferralCardRender";
import { parseDeferralButtonContent, sanitizeDeferralButtonUrl } from "@shared/deferralCardButton";
import {
  DEFAULT_DEFERRAL_CARDS_CONFIG,
  DEFAULT_DEFERRAL_CARD_TEMPLATES,
  normalizeDeferralCardsConfig,
  DEFERRAL_SCENARIO_META,
  type DeferralScenarioId,
} from "@shared/deferralCardTypes";
import { CARD_TEMPLATES, templateSupportsScenario, templatesForScenario } from "./templates";

const BAN_ONLY = new Set(["ban_reason", "ban_expires"]);
const isBan = (id: string) => id === "ban_temporary" || id === "ban_permanent";

const cases = CARD_TEMPLATES.flatMap((tpl) =>
  DEFERRAL_SCENARIO_META.filter((m) => templateSupportsScenario(tpl, m.id)).map(
    (m) => [tpl.id, m.id, tpl] as const,
  ),
);

describe("card templates", () => {
  test("ids are unique", () => {
    const ids = CARD_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every scenario has at least two templates", () => {
    for (const meta of DEFERRAL_SCENARIO_META) {
      expect(templatesForScenario(meta.id).length).toBeGreaterThanOrEqual(2);
    }
  });

  test.each(cases)("%s on %s builds a valid canvas", (_id, scenarioId, tpl) => {
    const canvas = tpl.build(scenarioId as DeferralScenarioId, DEFAULT_DEFERRAL_CARD_TEMPLATES[scenarioId as DeferralScenarioId].title);
    expect(canvas.width).toBeGreaterThanOrEqual(DEFERRAL_CARD_WIDTH_MIN);
    expect(canvas.width).toBeLessThanOrEqual(DEFERRAL_CARD_WIDTH_MAX);
    expect(canvas.height).toBeGreaterThanOrEqual(DEFERRAL_CARD_HEIGHT_MIN);
    expect(canvas.height).toBeLessThanOrEqual(DEFERRAL_CARD_HEIGHT_MAX);
    expect(canvas.elements.length).toBeGreaterThan(0);

    const ids = canvas.elements.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);

    expect(normalizeCanvasElements(canvas.elements, canvas.width, canvas.height)).toEqual(canvas.elements);

    const contentWidth = getCanvasContentWidth(canvas.width);
    const contentHeight = canvas.height - DEFERRAL_CARD_PADDING * 2;
    for (const el of canvas.elements) {
      if (!isBan(scenarioId)) expect(BAN_ONLY.has(el.type)).toBe(false);
      expect(el.type).not.toBe("logo");
      expect(el.content ?? "").not.toContain("data:");
      expect(el.x + (el.width ?? 0)).toBeLessThanOrEqual(contentWidth);
      expect(el.y + (el.height ?? 0)).toBeLessThanOrEqual(contentHeight);
      if (el.type === "button") {
        const btn = parseDeferralButtonContent(el.content);
        const resolved = btn.url.replaceAll("{discordInvite}", "https://discord.gg/example");
        expect(sanitizeDeferralButtonUrl(resolved)).toBeTruthy();
      }
    }

    const sorted = [...canvas.elements].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      expect(sorted[i]!.y).toBeGreaterThanOrEqual(prev.y + (prev.height ?? 0));
    }
  });

  test.each(cases)("%s on %s survives export and import", (_id, scenarioId, tpl) => {
    const id = scenarioId as DeferralScenarioId;
    const base = normalizeDeferralCardsConfig(DEFAULT_DEFERRAL_CARDS_CONFIG);
    const canvas = tpl.build(id, base.scenarios[id].title);
    const config = patchDeferralScenario(base, id, templateWithCanvas(base.scenarios[id], canvas));
    const result = importDeferralCardFile(base, exportDeferralScenario(config, id), { installedAddonIds: [] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const imported = getTemplateCanvas(normalizeDeferralCardsConfig(result.config).scenarios[id]);
    expect(imported.width).toBe(canvas.width);
    expect(imported.height).toBe(canvas.height);
    expect(imported.elements.map((e) => [e.type, e.content ?? ""])).toEqual(
      canvas.elements.map((e) => [e.type, e.content ?? ""]),
    );
  });
});
