<script lang="ts" module>
  export type SelectOption = { value: string; label: string };
</script>

<script lang="ts">
  import { t } from "../locale/locale";
  import {
    deferralBlockLabel,
    deferralScenarioLabel,
    deferralSizePresetLabel,
  } from "../locale/deferralStudioLocale";
  import Button from "./primitives/Button.svelte";
  import Tooltip from "./primitives/Tooltip.svelte";
  import Select from "./primitives/Select.svelte";
  import DropdownMenu from "./primitives/DropdownMenu.svelte";
  import DropdownItem from "./primitives/DropdownItem.svelte";
  import DropdownSeparator from "./primitives/DropdownSeparator.svelte";
  import Icon from "./Icon.svelte";
  import {
    DEFERRAL_SCENARIO_META,
    type DeferralBlockType,
    type DeferralCardSizePresetId,
  } from "../studioState.svelte";
  import { DEFERRAL_CARD_SIZE_PRESETS } from "@shared/deferralCardCanvas";
  import type { DeferralAddonScenarioMeta } from "@shared/deferralAddonTypes";
  import type { DeferralStudioPrefs } from "../prefs";

  let {
    scenarioId,
    onScenarioChange,
    addonScenarios = [],
    sizePreset,
    cardSize,
    onSizePresetChange,
    onApplyCardSize,
    addableTypes,
    onAddBlock,
    studioPrefs,
    onStudioPrefsChange,
    onExportAll,
    onExportAllLua,
    onExportScenario,
    onExportScenarioLua,
    onImport,
    onRestoreDefault,
    onSave,
    onPreview,
    isSaving,
    isCurrentDirty,
    dirtyScenarioIds,
  }: {
    scenarioId: string | null;
    onScenarioChange: (id: string) => void;
    addonScenarios?: DeferralAddonScenarioMeta[];
    sizePreset: DeferralCardSizePresetId | "custom";
    cardSize: { width: number; height: number };
    onSizePresetChange: (preset: DeferralCardSizePresetId | "custom") => void;
    onApplyCardSize: (w: number, h: number, preset: DeferralCardSizePresetId | "custom") => void;
    addableTypes: DeferralBlockType[];
    onAddBlock: (type: DeferralBlockType) => void;
    studioPrefs: DeferralStudioPrefs;
    onStudioPrefsChange: (patch: Partial<DeferralStudioPrefs>) => void;
    onExportAll: () => void;
    onExportAllLua: () => void;
    onExportScenario: () => void;
    onExportScenarioLua: () => void;
    onImport: () => void;
    onRestoreDefault: () => void;
    onSave: () => void;
    onPreview: () => void;
    isSaving: boolean;
    isCurrentDirty: boolean;
    dirtyScenarioIds: string[];
  } = $props();

  const scenarioOptions = $derived.by(() => [
    ...DEFERRAL_SCENARIO_META.map((s) => ({
      value: s.id,
      label: `${deferralScenarioLabel(t, s.id, s.label)}${dirtyScenarioIds.includes(s.id) ? " •" : ""}`,
      group: t("panel.card_editor.toolbar.group_core"),
    })),
    ...addonScenarios.map((s) => ({
      value: s.id,
      label: `${deferralScenarioLabel(t, s.id, s.label)}${dirtyScenarioIds.includes(s.id) ? " •" : ""}`,
      group: t("panel.card_editor.toolbar.group_addons"),
    })),
  ]);

  const sizeOptions = $derived.by(() => [
    ...(Object.entries(DEFERRAL_CARD_SIZE_PRESETS) as [
      DeferralCardSizePresetId,
      (typeof DEFERRAL_CARD_SIZE_PRESETS)[DeferralCardSizePresetId],
    ][]).map(([id]) => ({ value: id, label: deferralSizePresetLabel(t, id) })),
    { value: "custom", label: t("panel.card_editor.toolbar.size_custom") },
  ]);
</script>

<div class="bg-card/80 flex h-12 shrink-0 items-center gap-2 rounded-xl border px-3 backdrop-blur-sm">

  <Select
    options={scenarioOptions}
    value={scenarioId ?? ""}
    placeholder={t("panel.card_editor.toolbar.scenario_placeholder")}
    onValueChange={(v) => onScenarioChange(v)}
    class="h-8 w-44 shrink-0"
    id="studio-scenario"
  />

  <div
    class="flex items-center gap-2 transition-opacity"
    class:pointer-events-none={!scenarioId}
    class:opacity-40={!scenarioId}
  >
    <div class="bg-border h-5 w-px shrink-0"></div>

    <Select
      options={sizeOptions}
      value={sizePreset}
      onValueChange={(v) => {
        if (v === "custom") { onSizePresetChange("custom"); return; }
        const preset = DEFERRAL_CARD_SIZE_PRESETS[v as DeferralCardSizePresetId];
        onApplyCardSize(preset.width, preset.height, v as DeferralCardSizePresetId);
      }}
      class="h-8 w-36 shrink-0"
      id="studio-card-size"
    />

    {#if sizePreset === "custom"}
      <div class="flex shrink-0 items-center gap-1">
        <input
          type="number"
          min={320}
          max={720}
          style="width:3.5rem"
          class="border-input bg-background ring-offset-background h-8 shrink-0 rounded-md border px-1.5 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("panel.card_editor.toolbar.card_width_aria")}
          value={cardSize.width}
          oninput={(e) => onApplyCardSize(Number((e.target as HTMLInputElement).value) || cardSize.width, cardSize.height, "custom")}
        />
        <span class="text-muted-foreground select-none text-xs">×</span>
        <input
          type="number"
          min={120}
          max={480}
          style="width:3.5rem"
          class="border-input bg-background ring-offset-background h-8 shrink-0 rounded-md border px-1.5 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("panel.card_editor.toolbar.card_height_aria")}
          value={cardSize.height}
          oninput={(e) => onApplyCardSize(cardSize.width, Number((e.target as HTMLInputElement).value) || cardSize.height, "custom")}
        />
      </div>
    {/if}

    <div class="bg-border h-5 w-px shrink-0"></div>

    <DropdownMenu>
      {#snippet trigger()}
        <Button type="button" size="sm" variant="secondary" class="h-8 shrink-0">
          <Icon name="plus" class="mr-1 size-3.5" />
          {t("panel.card_editor.toolbar.add")}
        </Button>
      {/snippet}
      {#each addableTypes as type (type)}
        <DropdownItem onclick={() => onAddBlock(type)}>
          {deferralBlockLabel(t, type)}
        </DropdownItem>
      {/each}
    </DropdownMenu>

    <div class="bg-border h-5 w-px shrink-0"></div>

    <Tooltip label={t("panel.card_editor.toolbar.snap_to_grid")}>
      <Button
        type="button" size="icon"
        variant={studioPrefs.snapToGrid ? "secondary" : "ghost"}
        class="size-8 shrink-0"
        aria-label={t("panel.card_editor.toolbar.snap_to_grid")}
        aria-pressed={studioPrefs.snapToGrid}
        onclick={() => onStudioPrefsChange({ snapToGrid: !studioPrefs.snapToGrid })}
      >
        <Icon name="magnet" class="size-4" />
      </Button>
    </Tooltip>
    <Tooltip label={t("panel.card_editor.toolbar.show_grid")}>
      <Button
        type="button" size="icon"
        variant={studioPrefs.showGrid ? "secondary" : "ghost"}
        class="size-8 shrink-0"
        aria-label={t("panel.card_editor.toolbar.show_grid")}
        aria-pressed={studioPrefs.showGrid}
        onclick={() => onStudioPrefsChange({ showGrid: !studioPrefs.showGrid })}
      >
        <Icon name="grid" class="size-4" />
      </Button>
    </Tooltip>
  </div>

  <div class="flex-1"></div>

  <div class="border-border/50 flex shrink-0 items-center gap-2 border-l pl-3">
    <Tooltip label={t("panel.card_editor.canvas.preview_title")}>
      <Button
        type="button" size="icon"
        variant="ghost"
        class="size-8 shrink-0"
        aria-label={t("panel.card_editor.canvas.preview_title")}
        disabled={!scenarioId}
        onclick={onPreview}
      >
        <Icon name="eye" class="size-4" />
      </Button>
    </Tooltip>

    <DropdownMenu align="end">
      {#snippet trigger()}
        <Button type="button" size="sm" variant="ghost" class="h-8">
          <Icon name="more-horizontal" class="mr-1 size-3.5" />
          {t("panel.card_editor.toolbar.file")}
        </Button>
      {/snippet}
      <DropdownItem onclick={onExportAll}>
        <Icon name="download" class="mr-2 size-4" />
        {t("panel.card_editor.toolbar.export_all")}
      </DropdownItem>
      <DropdownItem disabled={!scenarioId} onclick={onExportScenario}>
        <Icon name="download" class="mr-2 size-4" />
        {t("panel.card_editor.toolbar.export_scenario")}
      </DropdownItem>
      <DropdownItem onclick={onExportAllLua}>
        <Icon name="download" class="mr-2 size-4" />
        {t("panel.card_editor.toolbar.export_all_lua")}
      </DropdownItem>
      <DropdownItem disabled={!scenarioId} onclick={onExportScenarioLua}>
        <Icon name="download" class="mr-2 size-4" />
        {t("panel.card_editor.toolbar.export_scenario_lua")}
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem disabled={!scenarioId} onclick={onRestoreDefault}>
        <Icon name="rotate-ccw" class="mr-2 size-4" />
        {t("panel.card_editor.toolbar.restore_default")}
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem onclick={onImport}>
        <Icon name="upload" class="mr-2 size-4" />
        {t("panel.card_editor.toolbar.import")}
      </DropdownItem>
    </DropdownMenu>

    <div class="bg-border h-5 w-px shrink-0"></div>

    <Button
      type="button" size="sm" class="h-8 shrink-0"
      onclick={onSave}
      disabled={isSaving || !scenarioId || !isCurrentDirty}
    >
      <Icon name="save" class="mr-1.5 size-3.5" />
      {isCurrentDirty ? t("panel.card_editor.toolbar.save_card") : t("panel.card_editor.toolbar.saved")}
    </Button>

  </div>

</div>
