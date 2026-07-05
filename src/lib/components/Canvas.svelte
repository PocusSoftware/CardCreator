<script lang="ts">
  import { t } from "../locale/locale";
  import Card from "./Card.svelte";
  import {
    DEFERRAL_CANVAS_SNAP_GRID,
    DEFERRAL_CARD_WIDTH_MAX,
    DEFERRAL_CARD_WIDTH_MIN,
    DEFERRAL_CARD_HEIGHT_MAX,
    DEFERRAL_CARD_HEIGHT_MIN,
  } from "@shared/deferralCardCanvas";
  import type { DeferralCardTemplate } from "@shared/deferralCardTypes";
  import type { DeferralCardTokens } from "@shared/deferralCardRender";
  import type { DeferralCanvasElement } from "@shared/deferralCardCanvas";

  let {
    cardWidth,
    cardHeight,
    elements,
    selectedId,
    showGrid,
    snapToGrid,
    template,
    tokens,
    isBlank,
    onSelect,
    onMoveElement,
  }: {
    cardWidth: number;
    cardHeight: number;
    elements: DeferralCanvasElement[];
    selectedId: string | null;
    showGrid: boolean;
    snapToGrid: boolean;
    template: DeferralCardTemplate;
    tokens: DeferralCardTokens;
    isBlank: boolean;
    onSelect: (id: string | null) => void;
    onMoveElement: (id: string, x: number, y: number) => void;
  } = $props();
</script>

<div class="bg-muted/20 relative flex min-h-0 h-full w-full flex-col overflow-hidden rounded-xl border">
  <div
    class="pointer-events-none absolute inset-0 opacity-[0.35]"
    style="background-image:radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px);background-size:20px 20px"
  ></div>

  <div class="relative flex flex-1 flex-col items-center justify-center overflow-auto p-6">
    <div class="mb-4 text-center">
      <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {t("panel.card_editor.canvas.editor_title")}
      </p>
      <p class="text-muted-foreground/80 mt-1 text-xs">
        {t("panel.card_editor.canvas.size_line", { width: cardWidth, height: cardHeight })}
        {snapToGrid
          ? ` · ${t("panel.card_editor.canvas.snap_grid", { grid: DEFERRAL_CANVAS_SNAP_GRID })}`
          : ` · ${t("panel.card_editor.canvas.snap_free")}`}
        {#if showGrid}· {t("panel.card_editor.canvas.grid_visible", { grid: DEFERRAL_CANVAS_SNAP_GRID })}{/if}
        · {t("panel.card_editor.canvas.max_size", { maxW: DEFERRAL_CARD_WIDTH_MAX, maxH: DEFERRAL_CARD_HEIGHT_MAX })}
      </p>
    </div>

    {#if isBlank}
      <div
        class="border-border text-muted-foreground bg-card/50 flex min-h-5 items-center justify-center rounded-lg border border-dashed px-8 text-center text-sm"
        style="width:{cardWidth}px;margin-top:25px"
      >
        {t("panel.card_editor.canvas.blank_hint")}
      </div>
    {:else}
      <Card
        {cardWidth}
        {cardHeight}
        {elements}
        {selectedId}
        {showGrid}
        {snapToGrid}
        {template}
        {tokens}
        {onSelect}
        {onMoveElement}
      />
    {/if}
  </div>
</div>
