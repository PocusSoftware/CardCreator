<script lang="ts">
  import { t } from "../locale/locale";
  import { deferralBlockLabel, deferralSizePresetLabel } from "../locale/deferralStudioLocale";
  import { cn } from "../cn";
  import Button from "./primitives/Button.svelte";
  import Tooltip from "./primitives/Tooltip.svelte";
  import Select from "./primitives/Select.svelte";
  import DropdownMenu from "./primitives/DropdownMenu.svelte";
  import DropdownItem from "./primitives/DropdownItem.svelte";
  import Icon from "./Icon.svelte";
  import type { DeferralBlockType, DeferralCardSizePresetId } from "../studioState.svelte";
  import {
    DEFERRAL_CARD_SIZE_PRESETS,
    DEFERRAL_CARD_HEIGHT_MAX,
    DEFERRAL_CARD_HEIGHT_MIN,
    DEFERRAL_CARD_WIDTH_MAX,
    DEFERRAL_CARD_WIDTH_MIN,
  } from "@shared/deferralCardCanvas";
  import type { DeferralStudioPrefs } from "../prefs";

  let {
    disabled,
    sizePreset,
    cardSize,
    onSizePresetChange,
    onApplyCardSize,
    addableTypes,
    onAddBlock,
    studioPrefs,
    onStudioPrefsChange,
    onPreview,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
  }: {
    disabled: boolean;
    sizePreset: DeferralCardSizePresetId | "custom";
    cardSize: { width: number; height: number };
    onSizePresetChange: (preset: DeferralCardSizePresetId | "custom") => void;
    onApplyCardSize: (w: number, h: number, preset: DeferralCardSizePresetId | "custom") => void;
    addableTypes: DeferralBlockType[];
    onAddBlock: (type: DeferralBlockType) => void;
    studioPrefs: DeferralStudioPrefs;
    onStudioPrefsChange: (patch: Partial<DeferralStudioPrefs>) => void;
    onPreview: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  } = $props();

  const sizeOptions = $derived([
    ...(Object.keys(DEFERRAL_CARD_SIZE_PRESETS) as DeferralCardSizePresetId[]).map((id) => ({
      value: id,
      label: deferralSizePresetLabel(t, id),
      disabled: true,
    })),
    { value: "custom", label: t("panel.card_editor.toolbar.size_custom") },
  ]);

  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modKey = isMac ? "⌘" : "Ctrl+";
  const undoLabel = $derived(`${t("panel.card_editor.toolbar.undo")} (${modKey}Z)`);
  const redoLabel = $derived(`${t("panel.card_editor.toolbar.redo")} (${modKey}${isMac ? "⇧Z" : "Y"})`);

  const sizeInputClass =
    "h-8 w-16 rounded-[var(--radius-control)] border bg-background px-1.5 text-center font-mono text-xs tabular-nums transition-colors duration-150 hover:border-border-strong";
</script>

<div
  class={cn(
    "bg-card/90 flex h-11 items-center gap-1 rounded-[var(--radius-card)] border px-1.5 shadow-lg shadow-black/30 backdrop-blur transition-opacity",
    disabled && "pointer-events-none opacity-40",
  )}
  role="toolbar"
  aria-label={t("panel.card_editor.canvas.editor_title")}
>
  <Tooltip label={undoLabel}>
    <Button size="icon" variant="ghost" aria-label={undoLabel} disabled={!canUndo} onclick={onUndo}>
      <Icon name="undo" class="size-4" />
    </Button>
  </Tooltip>
  <Tooltip label={redoLabel}>
    <Button size="icon" variant="ghost" aria-label={redoLabel} disabled={!canRedo} onclick={onRedo}>
      <Icon name="redo" class="size-4" />
    </Button>
  </Tooltip>

  <div class="bg-border mx-1 h-5 w-px"></div>

  <Select
    options={sizeOptions}
    value={sizePreset}
    onValueChange={(v) => {
      if (v === "custom") {
        onSizePresetChange("custom");
        return;
      }
      const preset = DEFERRAL_CARD_SIZE_PRESETS[v as DeferralCardSizePresetId];
      onApplyCardSize(preset.width, preset.height, v as DeferralCardSizePresetId);
    }}
    class="h-8 w-40 shrink-0"
    id="studio-card-size"
  />

  {#if sizePreset === "custom"}
    <div class="flex items-center gap-1">
      <input
        type="number"
        min={DEFERRAL_CARD_WIDTH_MIN}
        max={DEFERRAL_CARD_WIDTH_MAX}
        class={sizeInputClass}
        aria-label={t("panel.card_editor.toolbar.card_width_aria")}
        value={cardSize.width}
        onchange={(e) =>
          onApplyCardSize(Number(e.currentTarget.value) || cardSize.width, cardSize.height, "custom")}
      />
      <span class="text-subtle-foreground text-xs select-none">×</span>
      <input
        type="number"
        min={DEFERRAL_CARD_HEIGHT_MIN}
        max={DEFERRAL_CARD_HEIGHT_MAX}
        class={sizeInputClass}
        aria-label={t("panel.card_editor.toolbar.card_height_aria")}
        value={cardSize.height}
        onchange={(e) =>
          onApplyCardSize(cardSize.width, Number(e.currentTarget.value) || cardSize.height, "custom")}
      />
    </div>
  {/if}

  <div class="bg-border mx-1 h-5 w-px"></div>

  <DropdownMenu>
    {#snippet trigger()}
      <Button size="sm" variant="ghost-secondary" tabindex={-1}>
        <Icon name="plus" class="size-4" />
        {t("panel.card_editor.toolbar.add")}
      </Button>
    {/snippet}
    {#each addableTypes as type (type)}
      <DropdownItem onclick={() => onAddBlock(type)}>
        {deferralBlockLabel(t, type)}
      </DropdownItem>
    {/each}
  </DropdownMenu>

  <div class="bg-border mx-1 h-5 w-px"></div>

  <Tooltip label={t("panel.card_editor.toolbar.snap_to_grid")}>
    <Button
      size="icon"
      variant={studioPrefs.snapToGrid ? "ghost-secondary" : "ghost"}
      class={studioPrefs.snapToGrid ? "bg-hover" : ""}
      aria-label={t("panel.card_editor.toolbar.snap_to_grid")}
      aria-pressed={studioPrefs.snapToGrid}
      onclick={() => onStudioPrefsChange({ snapToGrid: !studioPrefs.snapToGrid })}
    >
      <Icon name="magnet" class="size-4" />
    </Button>
  </Tooltip>
  <Tooltip label={t("panel.card_editor.toolbar.show_grid")}>
    <Button
      size="icon"
      variant={studioPrefs.showGrid ? "ghost-secondary" : "ghost"}
      class={studioPrefs.showGrid ? "bg-hover" : ""}
      aria-label={t("panel.card_editor.toolbar.show_grid")}
      aria-pressed={studioPrefs.showGrid}
      onclick={() => onStudioPrefsChange({ showGrid: !studioPrefs.showGrid })}
    >
      <Icon name="grid" class="size-4" />
    </Button>
  </Tooltip>

  <div class="bg-border mx-1 h-5 w-px"></div>

  <Tooltip label={t("panel.card_editor.canvas.preview_title")}>
    <Button size="icon" variant="ghost" aria-label={t("panel.card_editor.canvas.preview_title")} onclick={onPreview}>
      <Icon name="eye" class="size-4" />
    </Button>
  </Tooltip>
</div>
