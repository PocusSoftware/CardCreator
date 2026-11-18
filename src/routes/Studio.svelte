<script lang="ts">
  import { createStudioState, t } from "../lib/studioState.svelte";
  import { deferralBlockLabel } from "../lib/locale/deferralStudioLocale";
  import Toolbar from "../lib/components/Toolbar.svelte";
  import Header from "../lib/components/Header.svelte";
  import ScenarioList from "../lib/components/ScenarioList.svelte";
  import TemplatesDialog from "../lib/components/TemplatesDialog.svelte";
  import DocsDialog from "../lib/components/DocsDialog.svelte";
  import { templatesForScenario } from "../lib/templates";
  import { isAddonDeferralScenarioId } from "@shared/deferralAddonTypes";
  import Canvas from "../lib/components/Canvas.svelte";
  import Layers from "../lib/components/Layers.svelte";
  import ButtonEditor from "../lib/components/ButtonEditor.svelte";
  import AnimatedImage from "../lib/components/AnimatedImage.svelte";
  import Button from "../lib/components/primitives/Button.svelte";
  import Input from "../lib/components/primitives/Input.svelte";
  import AutosizeTextarea from "../lib/components/primitives/AutosizeTextarea.svelte";
  import Icon from "../lib/components/Icon.svelte";
  import Select from "../lib/components/primitives/Select.svelte";
  import {
    DEFERRAL_SCENARIO_META,
    DEFERRAL_SVG_MAX_BYTES,
    DEFERRAL_PNG_MAX_BYTES,
    deferralCustomImageHasPreview,
  } from "../lib/studioState.svelte";
  import { openPreview } from "../lib/preview.svelte";

  const s = createStudioState();

  const handlePreview = () => {
    if (!s.scenarioId) return;
    openPreview(s.deferralCardsForFileOps, s.scenarioId);
  };

  let templatesOpen = $state(false);
  let docsOpen = $state(false);

  const scenarioLabel = $derived(s.scenarioId ? s.scenarioLabel(s.scenarioId) : null);
  const scenarioDescription = $derived(
    s.scenarioId
      ? t(
          `panel.card_editor.scenarios.${s.scenarioId}.description`,
          undefined,
          DEFERRAL_SCENARIO_META.find((m) => m.id === s.scenarioId)?.description ?? "",
        )
      : null,
  );
  const canUseTemplates = $derived(
    !!s.scenarioId && !isAddonDeferralScenarioId(s.scenarioId) && templatesForScenario(s.scenarioId).length > 0,
  );
  const scenarioOptions = $derived(
    DEFERRAL_SCENARIO_META.map((m) => ({
      value: m.id,
      label: s.scenarioLabel(m.id),
      group: t(`panel.card_editor.app.groups.${m.group}`),
    })),
  );
  const isTextType = (type: string) =>
    type === "heading" || type === "paragraph" || type === "text" || type === "custom_text";
  const showsPosition = (type: string) =>
    type !== "button" && type !== "custom_image" && type !== "logo" && !isTextType(type);

  let importInputEl: HTMLInputElement | null = null;
  let svgUploadInputEl = $state<HTMLInputElement | null>(null);

  const blankTemplate = {
    title: "",
    bodyTemplate: "",
    showRequestId: true,
    showTierName: false,
    customPlaceholders: [],
  };

  const onImportInput = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) await s.handleImportFile(file);
  };

  const onSvgUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    await s.handleUploadImage(file);
  };

  const isEditableTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  };

  const onWindowKeydown = (e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key !== "z" && key !== "y") return;
    if (isEditableTarget(e.target) || templatesOpen || docsOpen) return;
    e.preventDefault();
    if (key === "y" || (key === "z" && e.shiftKey)) {
      s.redo();
    } else {
      s.undo();
    }
  };
</script>

<svelte:window onkeydown={onWindowKeydown} />

<input
  bind:this={importInputEl}
  type="file"
  accept="application/json,.json"
  class="hidden"
  onchange={onImportInput}
/>

<div class="flex h-screen w-full flex-col overflow-hidden">
  <Header
    {scenarioLabel}
    {scenarioDescription}
    hasScenario={!!s.scenarioId}
    {canUseTemplates}
    isSaving={s.isSaving}
    isCurrentDirty={s.isCurrentDirty}
    onOpenTemplates={() => (templatesOpen = true)}
    onOpenDocs={() => (docsOpen = true)}
    onExportAll={s.handleExportAll}
    onExportAllLua={s.handleExportAllLua}
    onExportScenario={s.handleExportScenario}
    onExportScenarioLua={s.handleExportScenarioLua}
    onImport={() => importInputEl?.click()}
    onRestoreDefault={s.handleRestoreDefault}
    onSave={s.handleSave}
  />

  <div class="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:grid-cols-[264px_minmax(0,1fr)_320px] xl:overflow-hidden">
    <aside class="order-2 flex h-[70vh] min-h-0 flex-col border-t xl:order-none xl:h-auto xl:border-t-0 xl:border-r">
      <div class="min-h-0 flex-[3] overflow-y-auto px-2 py-4">
        <ScenarioList
          scenarioId={s.scenarioId}
          dirtyScenarioIds={s.dirtyScenarioIds}
          onSelect={s.handleSelectScenario}
        />
      </div>
      <div class="flex min-h-0 flex-[2] flex-col border-t">
        <div class="flex h-10 shrink-0 items-center gap-2 px-4">
          <Icon name="layers" class="text-subtle-foreground size-3.5" />
          <p class="eyebrow">{t("panel.card_editor.layers_heading")}</p>
          <span class="text-subtle-foreground ml-auto font-mono text-[11px] tabular-nums">{s.canvasElements.length}</span>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {#if s.scenarioId}
            <Layers
              elements={s.canvasElements}
              selectedId={s.selectedId}
              onSelect={s.setSelectedId}
              onToggleVisible={s.handleToggleLayerVisible}
              onReorder={s.handleReorderLayers}
              onRemove={s.handleRemoveElement}
            />
          {/if}
        </div>
      </div>
    </aside>

    <main class="relative order-1 h-[75vh] min-h-0 min-w-0 xl:order-none xl:h-auto">
      <div class="absolute top-3 left-1/2 z-20 -translate-x-1/2">
        <Toolbar
          disabled={!s.scenarioId}
          sizePreset={s.sizePreset}
          cardSize={s.cardSize}
          onSizePresetChange={(p) => s.applyCardSize(s.cardSize.width, s.cardSize.height, p)}
          onApplyCardSize={s.applyCardSize}
          addableTypes={s.addableTypes}
          onAddBlock={s.handleAddBlock}
          studioPrefs={s.studioPrefs}
          onStudioPrefsChange={s.updateStudioPrefs}
          onPreview={handlePreview}
          onUndo={s.undo}
          onRedo={s.redo}
          canUndo={s.canUndo}
          canRedo={s.canRedo}
        />
      </div>

      <div class="absolute top-16 left-1/2 z-20 w-64 -translate-x-1/2 xl:hidden">
        <Select
          id="studio-scenario-compact"
          options={scenarioOptions}
          value={s.scenarioId ?? ""}
          placeholder={t("panel.card_editor.toolbar.scenario_placeholder")}
          onValueChange={s.handleSelectScenario}
          class="h-9"
        />
      </div>

      {#if s.workingTemplate && s.scenarioId}
        <Canvas
          cardWidth={s.cardSize.width}
          cardHeight={s.cardSize.height}
          elements={s.canvasElements}
          selectedId={s.selectedId}
          showGrid={s.studioPrefs.showGrid}
          snapToGrid={s.studioPrefs.snapToGrid}
          template={s.workingTemplate}
          tokens={s.previewTokens}
          isBlank={false}
          onSelect={s.setSelectedId}
          onMoveElement={s.handleMoveElement}
          onRemove={s.handleRemoveElement}
        />
      {:else}
        <Canvas
          cardWidth={s.cardSize.width}
          cardHeight={s.cardSize.height}
          elements={[]}
          selectedId={null}
          showGrid={s.studioPrefs.showGrid}
          snapToGrid={s.studioPrefs.snapToGrid}
          template={blankTemplate}
          tokens={{}}
          isBlank
          onSelect={s.setSelectedId}
          onMoveElement={() => {}}
        />
      {/if}
    </main>

    <aside class="order-3 flex min-h-[50vh] flex-col border-t xl:order-none xl:min-h-0 xl:border-t-0 xl:border-l">
      <div class="flex h-10 shrink-0 items-center px-4">
        <p class="eyebrow">{t("panel.card_editor.properties_heading")}</p>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto">
        {#if s.selected}
          <div class="flex items-start justify-between gap-3 border-y px-4 py-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold">{deferralBlockLabel(t, s.selected.type)}</p>
              <p class="text-subtle-foreground mt-0.5 text-xs leading-relaxed text-pretty">
                {t(`panel.card_editor.blocks.${s.selected.type}.description`)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              class="hover:text-destructive shrink-0"
              aria-label={t("panel.card_editor.properties.delete")}
              onclick={s.handleRemoveSelected}
            >
              <Icon name="trash" class="size-4" />
            </Button>
          </div>

          <div class="flex flex-col gap-5 p-4">
            {#if isTextType(s.selected.type)}
              <div class="flex flex-col gap-1.5">
                <label class="text-muted-foreground text-xs font-medium" for="prop-content">
                  {t("panel.card_editor.properties.content")}
                </label>
                <AutosizeTextarea
                  id="prop-content"
                  value={s.selected.content ?? ""}
                  minHeight={s.selected.type === "custom_text" ? 120 : 88}
                  maxHeight={320}
                  placeholder={s.selected.type === "custom_text"
                    ? t("panel.card_editor.custom_text_placeholder")
                    : undefined}
                  oninput={(e) => s.handlePatchSelected({ content: e.currentTarget.value })}
                />
                <button
                  type="button"
                  class="text-subtle-foreground hover:text-foreground self-start text-xs underline decoration-border-strong underline-offset-2 transition-colors"
                  onclick={() => (docsOpen = true)}
                >
                  Placeholders and formatting
                </button>
              </div>
            {/if}

            {#if s.selected.type === "button"}
              <ButtonEditor
                content={s.selected.content}
                onChange={(serialized) => s.handlePatchSelected({ content: serialized })}
              />
            {/if}

            {#if s.selected.type === "custom_image"}
              <div class="flex flex-col gap-2">
                <p class="text-muted-foreground text-xs font-medium">{t("panel.card_editor.properties.image")}</p>
                <input
                  bind:this={svgUploadInputEl}
                  type="file"
                  accept=".svg,image/svg+xml,.png,image/png,.gif,image/gif"
                  class="hidden"
                  onchange={onSvgUpload}
                />
                {#if deferralCustomImageHasPreview(s.selected.content)}
                  <div class="bg-canvas flex max-h-36 items-center justify-center rounded-[var(--radius-control)] border p-3">
                    <AnimatedImage
                      src={s.selected.content ?? ""}
                      alt={t("panel.card_editor.image_preview_alt")}
                      class="max-h-28 max-w-full object-contain"
                    />
                  </div>
                {:else}
                  <p class="text-subtle-foreground rounded-[var(--radius-control)] border border-dashed p-3 text-xs leading-relaxed">
                    {t("panel.card_editor.no_image_yet", {
                      svgKb: Math.round(DEFERRAL_SVG_MAX_BYTES / 1024),
                      pngKb: Math.round(DEFERRAL_PNG_MAX_BYTES / 1024),
                    })}
                  </p>
                {/if}
                <div class="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onclick={() => svgUploadInputEl?.click()}>
                    <Icon name="image" class="size-4" />
                    {t("panel.card_editor.upload_image")}
                  </Button>
                  {#if s.selected.content}
                    <Button size="sm" variant="ghost" onclick={() => s.handlePatchSelected({ content: "" })}>
                      {t("panel.common.remove")}
                    </Button>
                  {/if}
                </div>
              </div>
            {/if}

            {#if showsPosition(s.selected.type)}
              <div class="flex flex-col gap-1.5">
                <p class="text-muted-foreground text-xs font-medium">{t("panel.card_editor.properties.position")}</p>
                <div class="grid grid-cols-2 gap-2">
                  <label class="relative block">
                    <span class="text-subtle-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs">
                      {t("panel.card_editor.coord_x")}
                    </span>
                    <Input
                      type="number"
                      step={8}
                      class="pl-7 font-mono tabular-nums"
                      value={Math.round(s.selected.x)}
                      oninput={(e) => s.handlePatchSelected({ x: Number(e.currentTarget.value) || 0 })}
                    />
                  </label>
                  <label class="relative block">
                    <span class="text-subtle-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs">
                      {t("panel.card_editor.coord_y")}
                    </span>
                    <Input
                      type="number"
                      step={8}
                      class="pl-7 font-mono tabular-nums"
                      value={Math.round(s.selected.y)}
                      oninput={(e) => s.handlePatchSelected({ y: Number(e.currentTarget.value) || 0 })}
                    />
                  </label>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="flex flex-col items-center px-6 pt-16 text-center">
            <div class="bg-muted grid size-10 place-items-center rounded-full border">
              <Icon name="layers" class="text-subtle-foreground size-4" />
            </div>
            <p class="mt-3 text-sm font-medium">{t("panel.card_editor.properties.empty_title")}</p>
            <p class="text-muted-foreground mt-1 text-xs leading-relaxed text-pretty">
              {t("panel.card_editor.select_element_hint")}
            </p>
          </div>
        {/if}
      </div>
    </aside>
  </div>
</div>

<TemplatesDialog
  open={templatesOpen}
  onClose={() => (templatesOpen = false)}
  scenarioId={s.scenarioId}
  scenarioLabel={scenarioLabel ?? ""}
  baseTemplate={s.template}
  tokens={s.previewTokens}
  onApply={s.applyTemplate}
/>

<DocsDialog
  open={docsOpen}
  onClose={() => (docsOpen = false)}
  config={s.deferralCardsForFileOps}
  scenarioId={s.scenarioId}
  blockTypes={s.addableTypes}
/>
