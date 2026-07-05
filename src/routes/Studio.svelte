<script lang="ts">
  import { createStudioState, t } from "../lib/studioState.svelte";
  import { deferralBlockLabel } from "../lib/locale/deferralStudioLocale";
  import Toolbar from "../lib/components/Toolbar.svelte";
  import Canvas from "../lib/components/Canvas.svelte";
  import Layers from "../lib/components/Layers.svelte";
  import ButtonEditor from "../lib/components/ButtonEditor.svelte";
  import AnimatedImage from "../lib/components/AnimatedImage.svelte";
  import Button from "../lib/components/primitives/Button.svelte";
  import Input from "../lib/components/primitives/Input.svelte";
  import AutosizeTextarea from "../lib/components/primitives/AutosizeTextarea.svelte";
  import ScrollArea from "../lib/components/primitives/ScrollArea.svelte";
  import Icon from "../lib/components/Icon.svelte";
  import {
    DEFERRAL_CARD_CANVAS_WIDTH,
    DEFERRAL_CARD_CANVAS_HEIGHT,
    DEFERRAL_SVG_MAX_BYTES,
    DEFERRAL_PNG_MAX_BYTES,
    deferralCustomImageHasPreview,
  } from "../lib/studioState.svelte";
  import { readDeferralImageFile } from "@shared/deferralCardSvg";
  import { toast } from "../lib/toast.svelte";
  import { openPreview } from "../lib/preview.svelte";
  import PreviewOverlay from "../lib/components/PreviewOverlay.svelte";

  const s = createStudioState();

  const handlePreview = () => {
    if (!s.scenarioId) return;
    openPreview(s.deferralCardsForFileOps, s.scenarioId);
  };

  let importInputEl: HTMLInputElement | null = null;
  let svgUploadInputEl: HTMLInputElement | null = null;

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
</script>

<div class="flex h-screen w-full flex-col gap-3 p-3">
  <div class="relative z-30 shrink-0">
    <Toolbar
      scenarioId={s.scenarioId}
      onScenarioChange={s.handleSelectScenario}
      sizePreset={s.sizePreset}
      cardSize={s.cardSize}
      onSizePresetChange={(p) => s.applyCardSize(s.cardSize.width, s.cardSize.height, p)}
      onApplyCardSize={s.applyCardSize}
      addableTypes={s.addableTypes}
      onAddBlock={s.handleAddBlock}
      studioPrefs={s.studioPrefs}
      onStudioPrefsChange={s.updateStudioPrefs}
      onExportAll={s.handleExportAll}
      onExportAllLua={s.handleExportAllLua}
      onExportScenario={s.handleExportScenario}
      onExportScenarioLua={s.handleExportScenarioLua}
      onImport={() => importInputEl?.click()}
      onRestoreDefault={s.handleRestoreDefault}
      onSave={s.handleSave}
      onPreview={handlePreview}
      isSaving={s.isSaving}
      isCurrentDirty={s.isCurrentDirty}
      dirtyScenarioIds={s.dirtyScenarioIds}
    />
  </div>

  <input
    bind:this={importInputEl}
    type="file"
    accept="application/json,.json"
    class="hidden"
    onchange={onImportInput}
  />

  <div class="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[200px_minmax(0,1fr)_320px]">
    {#if s.scenarioId}
      <aside
        class="bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border"
      >
        <div
          class="text-foreground border-border/60 shrink-0 border-b px-3 py-2 text-xs font-semibold tracking-wide uppercase"
        >
          {t("panel.card_editor.layers_heading")}
        </div>
        <ScrollArea class="min-h-0 flex-1">
          <div class="p-2">
            <Layers
              elements={s.canvasElements}
              selectedId={s.selectedId}
              onSelect={s.setSelectedId}
              onToggleVisible={s.handleToggleLayerVisible}
              onReorder={s.handleReorderLayers}
            />
          </div>
        </ScrollArea>
      </aside>
    {:else}
      <div></div>
    {/if}

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

    <aside
      class="bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border"
    >
      <div
        class="text-foreground border-border/60 flex shrink-0 items-center justify-between border-b px-3 py-2 text-xs font-semibold tracking-wide uppercase"
      >
        <span>{t("panel.card_editor.properties_heading")}</span>
      </div>
      <ScrollArea class="min-h-0 flex-1">
        <div class="space-y-4 p-4">
          {#if s.selected}
            <div class="flex items-center justify-between">
              <p class="text-foreground text-sm font-medium">
                {deferralBlockLabel(t, s.selected.type)}
              </p>
              <Button type="button" size="icon" variant="ghost" onclick={s.handleRemoveSelected}>
                <Icon name="trash" class="size-4" />
              </Button>
            </div>

            {#if s.selected.type === "heading" || s.selected.type === "paragraph" || s.selected.type === "text" || s.selected.type === "custom_text"}
              <AutosizeTextarea
                value={s.selected.content ?? ""}
                minHeight={s.selected.type === "custom_text" ? 120 : 88}
                maxHeight={280}
                placeholder={s.selected.type === "custom_text"
                  ? t("panel.card_editor.custom_text_placeholder")
                  : undefined}
                oninput={(e) => s.handlePatchSelected({ content: (e.target as HTMLTextAreaElement).value })}
              />
            {/if}

            {#if s.selected.type === "button"}
              <ButtonEditor
                content={s.selected.content}
                onChange={(serialized) => s.handlePatchSelected({ content: serialized })}
              />
            {/if}

            {#if s.selected.type === "custom_image"}
              <div class="space-y-2">
                <input
                  bind:this={svgUploadInputEl}
                  type="file"
                  accept=".svg,image/svg+xml,.png,image/png,.gif,image/gif"
                  class="hidden"
                  onchange={onSvgUpload}
                />
                {#if deferralCustomImageHasPreview(s.selected.content)}
                  <div class="bg-muted/30 flex max-h-32 items-center justify-center rounded-md border p-3">
                    <AnimatedImage
                      src={s.selected.content ?? ""}
                      alt={t("panel.card_editor.image_preview_alt")}
                      class="max-h-28 max-w-full object-contain"
                    />
                  </div>
                {:else}
                  <p class="text-muted-foreground text-xs">
                    {t("panel.card_editor.no_image_yet", {
                      svgKb: Math.round(DEFERRAL_SVG_MAX_BYTES / 1024),
                      pngKb: Math.round(DEFERRAL_PNG_MAX_BYTES / 1024),
                    })}
                  </p>
                {/if}
                <div class="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onclick={() => svgUploadInputEl?.click()}
                  >
                    <Icon name="image" class="mr-1.5 size-4" />
                    {t("panel.card_editor.upload_image")}
                  </Button>
                  {#if s.selected.content}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onclick={() => s.handlePatchSelected({ content: "" })}
                    >
                      {t("panel.common.remove")}
                    </Button>
                  {/if}
                </div>
              </div>
            {/if}

            {#if s.selected.type !== "button" && s.selected.type !== "custom_image" && s.selected.type !== "heading" && s.selected.type !== "paragraph" && s.selected.type !== "text" && s.selected.type !== "custom_text" && s.selected.type !== "logo"}
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-foreground mb-1 block text-xs font-medium">
                    {t("panel.card_editor.coord_x")}
                  </span>
                  <Input
                    type="number"
                    step={8}
                    value={Math.round(s.selected.x)}
                    oninput={(e) => s.handlePatchSelected({ x: Number((e.target as HTMLInputElement).value) || 0 })}
                  />
                </div>
                <div>
                  <span class="text-foreground mb-1 block text-xs font-medium">
                    {t("panel.card_editor.coord_y")}
                  </span>
                  <Input
                    type="number"
                    step={8}
                    value={Math.round(s.selected.y)}
                    oninput={(e) => s.handlePatchSelected({ y: Number((e.target as HTMLInputElement).value) || 0 })}
                  />
                </div>
              </div>
            {/if}
          {:else}
            <p class="text-muted-foreground text-sm leading-relaxed">
              {t("panel.card_editor.select_element_hint")}
            </p>
          {/if}
        </div>
      </ScrollArea>
    </aside>
  </div>
</div>
