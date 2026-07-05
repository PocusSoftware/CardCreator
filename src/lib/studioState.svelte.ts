import { getDeferralTemplateOrDefault } from "@shared/deferralScenarioAccess";
import { isAddonDeferralScenarioId, type DeferralAddonMetaResponse } from "@shared/deferralAddonTypes";
import {
  type DeferralCardTemplate,
  type DeferralCardsConfig,
  type DeferralScenarioId,
  DEFERRAL_SCENARIO_META,
  DEFAULT_DEFERRAL_CARD_TEMPLATES,
  normalizeDeferralCardsConfig,
  applySharedPlaceholdersToDeferralConfig,
  resolveDeferralDiscordInvite,
} from "@shared/deferralCardTypes";
import {
  canonicalDeferralCardsForDiff,
  patchDeferralScenario,
  type DeferralCardTokens,
} from "@shared/deferralCardRender";
import {
  isDeferralScenarioDirty,
  listDirtyDeferralScenarioIds,
  mergeDeferralCardsAfterScenarioSave,
} from "@shared/deferralCardDirty";
import { syncLegacyFieldsFromLayout } from "@shared/deferralCardLayout";
import {
  exportDeferralCardsFull,
  exportDeferralCardsFullAsLua,
  exportDeferralScenario,
  exportDeferralScenarioAsLua,
  importDeferralCardFile,
} from "@shared/deferralCardExport";
import {
  type DeferralCanvasElement,
  type DeferralCardSizePresetId,
  clampCardSize,
  createCanvasElement,
  DEFERRAL_CARD_CANVAS_HEIGHT,
  DEFERRAL_CARD_CANVAS_WIDTH,
  DEFERRAL_CARD_SIZE_PRESETS,
  estimateCanvasElementSize,
  getCanvasContentWidth,
  getTemplateCanvas,
  loadStudioCanvasElements,
  normalizeCanvasElements,
  resolveCanvasHeight,
  snapDeferralCoord,
  templateWithCanvas,
} from "@shared/deferralCardCanvas";
import {
  DEFERRAL_PNG_MAX_BYTES,
  DEFERRAL_SVG_MAX_BYTES,
  deferralCustomImageHasPreview,
  readDeferralImageFile,
} from "@shared/deferralCardSvg";
import { rasterizeCanvasElements } from "@shared/deferralCardImage";
import { emsg } from "@shared/emsg";

import { t } from "./locale/locale";
import { deferralScenarioLabel } from "./locale/deferralStudioLocale";
import {
  DEFAULT_DEFERRAL_STUDIO_PREFS,
  loadDeferralStudioPrefs,
  saveDeferralStudioPrefs,
  type DeferralStudioPrefs,
} from "./prefs";
import { downloadJson, downloadText, loadStoredDeferralCards, persistDeferralCards } from "./persistence.svelte";
import { openConfirmDialog } from "./dialog.svelte";
import { toast } from "./toast.svelte";

export type { DeferralCanvasElement, DeferralCardTokens, DeferralCardTemplate, DeferralCardSizePresetId };

const PREVIEW_SAMPLE: Record<
  DeferralScenarioId,
  {
    body: string;
    requestId?: string;
    tierName?: string;
    banExpires?: string;
    banReason?: string;
    banId?: string;
    banDate?: string;
  }
> = {
  ban_temporary: {
    body: "You can join <strong>{discordInvite}</strong> to appeal this ban.",
    banExpires: "2 days",
    banReason: "Example ban",
    banId: "A12345",
    banDate: "Jun 2, 2026, 10:40:41 PM",
  },
  ban_permanent: {
    body: "You can join <strong>{discordInvite}</strong> to appeal this ban.",
    banReason: "Example permanent ban",
    banId: "A12345",
    banDate: "Jun 2, 2026, 10:40:41 PM",
  },
  whitelist_pending: {
    body: "Please join our Discord for whitelist instructions.",
    requestId: "R12345",
  },
  whitelist_schedule_closed: { body: "Whitelist applications are currently closed." },
  whitelist_admin_denied: { body: "" },
  whitelist_admin_insufficient_ids: { body: "" },
  whitelist_discord_member_denied: { body: "Join our Discord server to play." },
  whitelist_discord_member_insufficient_ids: { body: "" },
  whitelist_discord_roles_not_member: { body: "You must be in our Discord guild." },
  whitelist_discord_roles_no_roles: { body: "You need a whitelisted Discord role." },
  whitelist_discord_roles_insufficient_ids: { body: "" },
  whitelist_insufficient_license: { body: "" },
  whitelist_error: { body: "Could not verify Discord membership." },
  connection_queue: { body: "You are #3 in queue. Estimated wait: 2 minutes." },
  access_denied: { body: "You cannot join this server." },
};

const BASE_ADDABLE = [
  "heading",
  "text",
  "custom_text",
  "paragraph",
  "rejection_message",
  "request_id",
  "ban_id",
  "tier_name",
  "custom_image",
  "button",
  "spacer",
  "divider",
] as const;

const BAN_ADDABLE = ["ban_reason", "ban_expires"] as const;

export type DeferralBlockType =
  | (typeof BASE_ADDABLE)[number]
  | (typeof BAN_ADDABLE)[number];

function addableBlocksForScenario(scenarioId: string | null): DeferralBlockType[] {
  const isBan = scenarioId === "ban_temporary" || scenarioId === "ban_permanent";
  return isBan ? [...BASE_ADDABLE, ...BAN_ADDABLE] : [...BASE_ADDABLE];
}

function matchSizePreset(width: number, height: number): DeferralCardSizePresetId | "custom" {
  for (const [id, preset] of Object.entries(DEFERRAL_CARD_SIZE_PRESETS)) {
    if (preset.width === width && preset.height === height) {
      return id as DeferralCardSizePresetId;
    }
  }
  return "custom";
}

function initialCardSize(cfg: DeferralCardsConfig, scenarioId: string | null) {
  if (!scenarioId) {
    return { width: DEFERRAL_CARD_CANVAS_WIDTH, height: DEFERRAL_CARD_CANVAS_HEIGHT };
  }
  const canvas = getTemplateCanvas(getDeferralTemplateOrDefault(cfg, scenarioId));
  return { width: canvas.width, height: resolveCanvasHeight(canvas) };
}

const EMPTY_ADDON_META: DeferralAddonMetaResponse = {
  scenarios: [],
  tokens: [],
  installedAddonIds: [],
};

export function createStudioState() {
  const initialConfigRaw = loadStoredDeferralCards();
  const initialConfig = canonicalDeferralCardsForDiff(normalizeDeferralCardsConfig(initialConfigRaw));
  const initialScenario: string | null = DEFERRAL_SCENARIO_META[0]?.id ?? null;

  const initialCanvasElements: DeferralCanvasElement[] = (() => {
    if (!initialScenario) return [];
    const cfg = normalizeDeferralCardsConfig(initialConfigRaw);
    const tpl = getDeferralTemplateOrDefault(cfg, initialScenario);
    const sampleBody = PREVIEW_SAMPLE[initialScenario as DeferralScenarioId]?.body ?? "{customMessage}";
    return loadStudioCanvasElements(tpl, initialScenario, sampleBody);
  })();
  const initialCardSizeValue = initialCardSize(normalizeDeferralCardsConfig(initialConfigRaw), initialScenario);
  const initialSizePreset = matchSizePreset(initialCardSizeValue.width, initialCardSizeValue.height);

  let savedConfig = $state<DeferralCardsConfig>(initialConfig);
  let deferralCards = $state<DeferralCardsConfig>(normalizeDeferralCardsConfig(initialConfigRaw));
  let scenarioId = $state<string | null>(initialScenario);
  let canvasElements = $state<DeferralCanvasElement[]>(initialCanvasElements);
  let cardSize = $state<{ width: number; height: number }>(initialCardSizeValue);
  let sizePreset = $state<DeferralCardSizePresetId | "custom">(initialSizePreset);
  let selectedId = $state<string | null>(null);
  let isSaving = $state(false);
  let studioPrefs = $state<DeferralStudioPrefs>(
    typeof window !== "undefined" ? loadDeferralStudioPrefs() : DEFAULT_DEFERRAL_STUDIO_PREFS,
  );

  const snapCoord = (value: number) => (studioPrefs.snapToGrid ? snapDeferralCoord(value) : Math.round(value));

  const updateStudioPrefs = (patch: Partial<DeferralStudioPrefs>) => {
    studioPrefs = { ...studioPrefs, ...patch };
    saveDeferralStudioPrefs(studioPrefs);
  };

  const template = $derived(
    scenarioId ? getDeferralTemplateOrDefault(deferralCards, scenarioId) : null,
  );

  const selected = $derived(canvasElements.find((e) => e.id === selectedId) ?? null);

  const previewTokens = $derived.by<DeferralCardTokens>(() => {
    if (!scenarioId) return {};
    const sample = isAddonDeferralScenarioId(scenarioId)
      ? { body: "{customMessage}" }
      : PREVIEW_SAMPLE[scenarioId as DeferralScenarioId];
    return {
      requestId: sample.requestId,
      tierName: sample.tierName,
      customMessage: sample.body,
      guildName: "Your Discord",
      discordInvite: resolveDeferralDiscordInvite(deferralCards),
      serverName: "Your Server Name",
      playerName: "SniperSpools",
      queuePosition: "3",
      queueSize: "12",
      queueEta: "00:11",
      title: template?.title,
      body: sample.body,
      banExpires: sample.banExpires,
      banReason: sample.banReason,
      banId: sample.banId,
      banDate: sample.banDate,
    };
  });

  const workingTemplate = $derived.by<DeferralCardTemplate | null>(() => {
    if (!template || !scenarioId) return null;
    return templateWithCanvas(template, {
      width: cardSize.width,
      height: cardSize.height,
      elements: canvasElements,
    });
  });

  const dirtyScenarioIds = $derived(listDirtyDeferralScenarioIds(deferralCards, savedConfig));

  const isCurrentDirty = $derived.by(() => {
    if (!scenarioId || !workingTemplate) return false;
    return isDeferralScenarioDirty(workingTemplate, getDeferralTemplateOrDefault(savedConfig, scenarioId));
  });

  const hasAnyUnsavedChanges = $derived(dirtyScenarioIds.length > 0);

  const addableTypes = $derived(addableBlocksForScenario(scenarioId));

  const deferralCardsForFileOps = $derived.by<DeferralCardsConfig>(() => {
    if (!scenarioId || !workingTemplate) return deferralCards;
    return patchDeferralScenario(deferralCards, scenarioId, workingTemplate);
  });

  const scenarioLabel = (id: string) => {
    const core = DEFERRAL_SCENARIO_META.find((s) => s.id === id);
    const addon = EMPTY_ADDON_META.scenarios.find((s) => s.id === id);
    return deferralScenarioLabel(t, id, core?.label ?? addon?.label ?? id);
  };

  const loadScenarioIntoStudio = (id: string, cfg: DeferralCardsConfig = deferralCards) => {
    const tpl = getDeferralTemplateOrDefault(cfg, id);
    const canvas = getTemplateCanvas(tpl);
    const sampleBody = isAddonDeferralScenarioId(id)
      ? "{customMessage}"
      : (PREVIEW_SAMPLE[id as DeferralScenarioId]?.body ?? "");
    scenarioId = id;
    selectedId = null;
    cardSize = { width: canvas.width, height: resolveCanvasHeight(canvas) };
    sizePreset = matchSizePreset(canvas.width, resolveCanvasHeight(canvas));
    canvasElements = loadStudioCanvasElements(tpl, id, sampleBody);
  };

  const revertScenarioToSaved = (id: string) => {
    const savedTpl = getDeferralTemplateOrDefault(savedConfig, id);
    deferralCards = patchDeferralScenario(deferralCards, id, savedTpl);
    return savedTpl;
  };

  const confirmDiscardCurrent = async (onProceed: () => void) => {
    if (!scenarioId || !isCurrentDirty) {
      onProceed();
      return;
    }
    const id = scenarioId;
    await openConfirmDialog({
      title: t("panel.card_editor.discard_scenario_title"),
      message: `${scenarioLabel(id)} ${t("panel.card_editor.discard_scenario_message")}`,
      actionLabel: t("panel.card_editor.discard_action"),
      confirmBtnVariant: "destructive",
      onConfirm: () => {
        revertScenarioToSaved(id);
        onProceed();
      },
    });
  };

  const confirmLeaveStudio = async (onProceed: () => void) => {
    if (!hasAnyUnsavedChanges) {
      onProceed();
      return;
    }
    const names = dirtyScenarioIds.map(scenarioLabel).join(", ");
    await openConfirmDialog({
      title: t("panel.card_editor.leave_unsaved_title"),
      message: `${t("panel.card_editor.leave_unsaved_message")} ${names}. ${t("panel.card_editor.leave_unsaved_suffix")}`,
      actionLabel: t("panel.card_editor.leave_action"),
      confirmBtnVariant: "destructive",
      onConfirm: onProceed,
    });
  };

  const handleSelectScenario = (id: string) => {
    if (id === scenarioId) return;
    void confirmDiscardCurrent(() => loadScenarioIntoStudio(id));
  };

  const applyCardSize = (
    width: number,
    height: number,
    preset: DeferralCardSizePresetId | "custom",
  ) => {
    const clamped = clampCardSize(width, height);
    cardSize = clamped;
    sizePreset = preset;
    if (!scenarioId || !template) return;
    const normalized = normalizeCanvasElements(canvasElements, clamped.width, clamped.height);
    canvasElements = normalized;
    const next = templateWithCanvas(template, {
      width: clamped.width,
      height: clamped.height,
      elements: normalized,
    });
    deferralCards = patchDeferralScenario(deferralCards, scenarioId, next);
  };

  const persistCanvas = (elements: DeferralCanvasElement[]) => {
    if (!scenarioId || !template) return;
    const normalized = normalizeCanvasElements(elements, cardSize.width, cardSize.height);
    canvasElements = normalized;
    const next = templateWithCanvas(template, {
      width: cardSize.width,
      height: cardSize.height,
      elements: normalized,
    });
    deferralCards = patchDeferralScenario(deferralCards, scenarioId, next);
  };

  const handleMoveElement = (id: string, x: number, y: number) => {
    persistCanvas(canvasElements.map((e) => (e.id === id ? { ...e, x, y } : e)));
  };

  const handlePatchSelected = (patch: Partial<DeferralCanvasElement>) => {
    if (!selectedId) return;
    const snapped =
      patch.x !== undefined || patch.y !== undefined
        ? {
            ...patch,
            ...(patch.x !== undefined ? { x: snapCoord(patch.x) } : {}),
            ...(patch.y !== undefined ? { y: snapCoord(patch.y) } : {}),
          }
        : patch;
    persistCanvas(canvasElements.map((e) => (e.id === selectedId ? { ...e, ...snapped } : e)));
  };

  const handleAddBlock = (type: DeferralBlockType) => {
    const contentWidth = getCanvasContentWidth(cardSize.width);
    const maxY = canvasElements.reduce((m, e) => {
      const h = estimateCanvasElementSize(e, contentWidth).height;
      return Math.max(m, e.y + h);
    }, 0);
    persistCanvas([...canvasElements, createCanvasElement(type, snapCoord(maxY + 8), cardSize.width)]);
  };

  const handleRemoveSelected = () => {
    if (!selectedId) return;
    persistCanvas(canvasElements.filter((e) => e.id !== selectedId));
    selectedId = null;
  };

  const handleToggleLayerVisible = (id: string) => {
    persistCanvas(canvasElements.map((e) => (e.id === id ? { ...e, enabled: e.enabled === false } : e)));
  };

  const handleReorderLayers = (ordered: DeferralCanvasElement[]) => {
    persistCanvas(ordered);
  };

  const handleRestoreDefault = async () => {
    if (!scenarioId) return;
    const id = scenarioId;
    await openConfirmDialog({
      title: t("panel.card_editor.restore_default_title"),
      message: t("panel.card_editor.restore_default_message"),
      actionLabel: t("panel.card_editor.restore_action"),
      confirmBtnVariant: "destructive",
      onConfirm: () => {
        if (isAddonDeferralScenarioId(id)) {
          toast.error({
            title: t("panel.card_editor.cannot_restore_title"),
            msg: t("panel.card_editor.cannot_restore_msg"),
          });
          return;
        }
        const defaultTpl = structuredClone(DEFAULT_DEFERRAL_CARD_TEMPLATES[id as DeferralScenarioId]);
        const synced = syncLegacyFieldsFromLayout(defaultTpl);
        const canvas = getTemplateCanvas(synced);
        const height = resolveCanvasHeight(canvas);
        deferralCards = patchDeferralScenario(deferralCards, id, synced);
        cardSize = { width: canvas.width, height };
        sizePreset = matchSizePreset(canvas.width, height);
        canvasElements = loadStudioCanvasElements(
          synced,
          id,
          PREVIEW_SAMPLE[id as DeferralScenarioId]?.body ?? "",
        );
        selectedId = null;
        toast.success({
          title: t("panel.card_editor.default_restored_title"),
          msg: t("panel.card_editor.default_restored_msg"),
        });
      },
    });
  };

  const handleSave = async () => {
    if (!scenarioId || !template || !workingTemplate) {
      toast.error({
        title: t("panel.toasts.save_failed"),
        msg: t("panel.card_editor.save_failed_select_scenario"),
      });
      return;
    }
    if (!isCurrentDirty) return;

    setIsSaving(true);
    const label = scenarioLabel(scenarioId);
    const toastId = toast.loading(t("panel.card_editor.saving_scenario", { label }));
    const savedBefore = savedConfig;
    try {
      const rasterizedElements = await rasterizeCanvasElements(canvasElements);
      const workingWithCanvas = patchDeferralScenario(deferralCards, scenarioId, {
        ...templateWithCanvas(template, {
          width: cardSize.width,
          height: cardSize.height,
          elements: rasterizedElements,
        }),
      });
      const toPersist = applySharedPlaceholdersToDeferralConfig(workingWithCanvas);
      persistDeferralCards(toPersist);

      downloadJson(exportDeferralScenario(toPersist, scenarioId), `deferral-${scenarioId}.json`);

      const mergedWorking = mergeDeferralCardsAfterScenarioSave(
        toPersist,
        workingWithCanvas,
        savedBefore,
        scenarioId,
      );
      savedConfig = toPersist;
      deferralCards = mergedWorking;
      canvasElements = normalizeCanvasElements(rasterizedElements, cardSize.width, cardSize.height);
      toast.success(
        {
          title: t("panel.card_editor.scenario_saved_title", { label }),
          msg: t("panel.card_editor.scenario_saved_msg"),
        },
        { id: toastId },
      );
    } catch (error) {
      toast.error({ title: t("panel.toasts.save_failed"), msg: emsg(error) }, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportScenario = () => {
    if (!scenarioId) return;
    downloadJson(exportDeferralScenario(deferralCardsForFileOps, scenarioId), `deferral-${scenarioId}.json`);
    toast.success({ title: t("panel.toasts.card_exported"), msg: scenarioId });
  };

  const handleExportScenarioLua = () => {
    if (!scenarioId) return;
    downloadText(exportDeferralScenarioAsLua(deferralCardsForFileOps, scenarioId), `deferral-${scenarioId}.lua`);
    toast.success({ title: t("panel.toasts.card_exported"), msg: scenarioId });
  };

  const handleExportAll = () => {
    downloadJson(exportDeferralCardsFull(deferralCardsForFileOps), "deferral-cards-all.json");
    toast.success({
      title: t("panel.toasts.card_exported"),
      msg: t("panel.card_editor.cards_exported_msg"),
    });
  };

  const handleExportAllLua = () => {
    downloadText(exportDeferralCardsFullAsLua(deferralCardsForFileOps), "deferral-cards-all.lua");
    toast.success({
      title: t("panel.toasts.card_exported"),
      msg: t("panel.card_editor.cards_exported_msg"),
    });
  };

  const handleImportFile = async (file: File) => {
    try {
      const result = importDeferralCardFile(deferralCardsForFileOps, JSON.parse(await file.text()), {
        installedAddonIds: EMPTY_ADDON_META.installedAddonIds,
      });
      if (!result.ok) {
        toast.error({ title: t("panel.toasts.import_failed"), msg: result.error });
        return;
      }
      const imported = normalizeDeferralCardsConfig(result.config);
      deferralCards = imported;
      savedConfig = canonicalDeferralCardsForDiff(imported);
      persistDeferralCards(imported);

      const allImported = [...result.importedScenarios, ...result.importedAddonScenarios];
      const targetScenario: string | null =
        allImported.length === 1
          ? allImported[0]!
          : scenarioId && allImported.includes(scenarioId)
            ? scenarioId
            : (allImported[0] ?? null);

      if (targetScenario) {
        loadScenarioIntoStudio(targetScenario, imported);
      }

      if (result.skippedAddonScenarios.length) {
        toast.warning({
          title: t("panel.card_editor.addon_cards_skipped_title"),
          msg: result.skippedAddonScenarios.join(", "),
        });
      }

      toast.success({
        title: t("panel.card_editor.imported_title"),
        msg: t("panel.card_editor.imported_scenarios_msg", {
          count: result.importedScenarios.length,
        }),
      });
    } catch {
      toast.error({
        title: t("panel.toasts.import_failed"),
        msg: t("panel.card_editor.invalid_json"),
      });
    }
  };

  const handleUploadImage = async (file: File) => {
    const result = await readDeferralImageFile(file);
    if (!result.ok) {
      toast.error({
        title: t("panel.card_editor.image_upload_failed"),
        msg: result.error,
      });
      return null;
    }
    handlePatchSelected({ content: result.content });
    return result.content;
  };

  function setIsSaving(v: boolean) {
    isSaving = v;
  }

  return {
    get scenarioId() {
      return scenarioId;
    },
    get canvasElements() {
      return canvasElements;
    },
    get cardSize() {
      return cardSize;
    },
    get sizePreset() {
      return sizePreset;
    },
    get selectedId() {
      return selectedId;
    },
    get selected() {
      return selected;
    },
    get isSaving() {
      return isSaving;
    },
    get studioPrefs() {
      return studioPrefs;
    },
    get deferralCards() {
      return deferralCards;
    },
    get template() {
      return template;
    },
    get workingTemplate() {
      return workingTemplate;
    },
    get previewTokens() {
      return previewTokens;
    },
    get dirtyScenarioIds() {
      return dirtyScenarioIds;
    },
    get isCurrentDirty() {
      return isCurrentDirty;
    },
    get hasAnyUnsavedChanges() {
      return hasAnyUnsavedChanges;
    },
    get addableTypes() {
      return addableTypes;
    },
    get deferralCardsForFileOps() {
      return deferralCardsForFileOps;
    },
    handleSelectScenario,
    applyCardSize,
    handleMoveElement,
    handlePatchSelected,
    handleAddBlock,
    handleRemoveSelected,
    handleToggleLayerVisible,
    handleReorderLayers,
    handleRestoreDefault,
    handleSave,
    handleExportScenario,
    handleExportScenarioLua,
    handleExportAll,
    handleExportAllLua,
    handleImportFile,
    handleUploadImage,
    updateStudioPrefs,
    setSelectedId: (id: string | null) => {
      selectedId = id;
    },
    confirmLeaveStudio,
    scenarioLabel,
  };
}

export { t };
export {
  DEFERRAL_CARD_CANVAS_WIDTH,
  DEFERRAL_CARD_CANVAS_HEIGHT,
  DEFERRAL_SVG_MAX_BYTES,
  DEFERRAL_PNG_MAX_BYTES,
  deferralCustomImageHasPreview,
};
export { DEFERRAL_SCENARIO_META };
export { PREVIEW_SAMPLE };
export type { DeferralScenarioId };
