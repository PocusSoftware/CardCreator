<script lang="ts">
  import { t } from "../locale/locale";
  import Card from "./Card.svelte";
  import {
    DEFERRAL_CANVAS_SNAP_GRID,
    DEFERRAL_CARD_WIDTH_MAX,
    DEFERRAL_CARD_HEIGHT_MAX,
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
    onRemove,
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
    onRemove?: (id: string) => void;
  } = $props();
</script>

<div class="bg-canvas relative flex h-full min-h-0 w-full flex-col overflow-hidden">
  <div
    class="pointer-events-none absolute inset-0"
    style="background-image:radial-gradient(circle, rgba(244,244,243,0.08) 1px, transparent 1px);background-size:20px 20px"
  ></div>

  <div class="relative flex min-h-0 flex-1 flex-col overflow-auto px-6 pt-20 pb-16">
    <div class="m-auto">
      {#if isBlank}
        <div
          class="text-muted-foreground bg-card/50 flex min-h-24 items-center justify-center rounded-[var(--radius-card)] border border-dashed px-8 text-center text-sm"
          style:width="{cardWidth}px"
        >
          {t("panel.card_editor.canvas.blank_hint")}
        </div>
      {:else}
        <div class="deferral-card">
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
            {onRemove}
          />
        </div>
      {/if}
    </div>
  </div>

  <p class="text-subtle-foreground pointer-events-none absolute right-0 bottom-3 left-0 text-center font-mono text-[11px] tabular-nums">
    {t("panel.card_editor.canvas.size_line", { width: cardWidth, height: cardHeight })}
    · {snapToGrid
      ? t("panel.card_editor.canvas.snap_grid", { grid: DEFERRAL_CANVAS_SNAP_GRID })
      : t("panel.card_editor.canvas.snap_free")}
    {#if showGrid}· {t("panel.card_editor.canvas.grid_visible", { grid: DEFERRAL_CANVAS_SNAP_GRID })}{/if}
    · {t("panel.card_editor.canvas.max_size", { maxW: DEFERRAL_CARD_WIDTH_MAX, maxH: DEFERRAL_CARD_HEIGHT_MAX })}
  </p>
</div>
