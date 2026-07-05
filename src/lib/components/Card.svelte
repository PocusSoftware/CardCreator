<script lang="ts" module>
  import {
    DEFERRAL_CANVAS_SNAP_GRID,
    DEFERRAL_CARD_MARGIN_TOP,
    DEFERRAL_CARD_PADDING,
    estimateCanvasElementSize,
    getCanvasContentWidth,
    resolveTextLineContent,
    snapDeferralCoord,
    splitCustomMessageParts,
  } from "@shared/deferralCardCanvas";
  import {
    applyDeferralTokensPreview,
    applyDeferralMarkupTags,
    deferralSupplementalMessageEmpty,
    resolveDeferralIdDisplay,
    type DeferralCardTokens,
  } from "@shared/deferralCardRender";
  import { resolveDeferralElementContent } from "@shared/deferralCardBan";
  import {
    buildDeferralButtonAnchorStyle,
    parseDeferralButtonContent,
    sanitizeDeferralButtonUrl,
  } from "@shared/deferralCardButton";
  import type { DeferralCardTemplate } from "@shared/deferralCardTypes";
  import type { DeferralCanvasElement } from "@shared/deferralCardCanvas";
  import type { DeferralBlockType } from "@shared/deferralCardLayout";

  export interface CenterGuideState {
    vertical: boolean;
    horizontal: boolean;
  }

  export function parseContainerStyle(style: string | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!style) return out;
    for (const part of style.split(";")) {
      const [key, val] = part.split(":").map((s) => s.trim());
      if (!key || !val) continue;
      const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out[camel] = val;
    }
    return out;
  }

  export function renderElementInner(
    el: DeferralCanvasElement,
    template: DeferralCardTemplate,
    tokens: DeferralCardTokens,
    textLineIndex: number,
    messageParts: string[],
  ): string | null {
    const applyTokens = (text: string) =>
      applyDeferralTokensPreview(text, tokens, template.customPlaceholders ?? []);
    const fontSize = el.style?.fontSize ?? (el.type === "heading" ? 22 : 18);

    switch (el.type) {
      case "heading": {
        const text = resolveDeferralElementContent(
          el.content?.trim() || template.title || "Title",
          tokens,
        );
        return `<h2 class="m-0 leading-tight" style="font-size:${fontSize}px;color:#eee">${applyTokens(text)}</h2>`;
      }
      case "text":
      case "paragraph":
      case "custom_text": {
        if (el.type === "custom_text") {
          const raw = el.content?.trim() ?? "";
          const html = applyTokens(resolveDeferralElementContent(raw, tokens));
          if (raw.includes("{customMessage}") && deferralSupplementalMessageEmpty(html)) return null;
          return `<p class="m-0 leading-snug whitespace-pre-wrap" style="font-size:${fontSize}px;color:#eee">${html}</p>`;
        }
        const html = resolveTextLineContent(el, tokens, template, textLineIndex, messageParts, (text) =>
          applyDeferralMarkupTags(applyTokens(resolveDeferralElementContent(text, tokens))),
        );
        return `<p class="m-0 leading-snug" style="font-size:${fontSize}px;color:#eee">${html}</p>`;
      }
      case "rejection_message": {
        const html = applyDeferralMarkupTags(
          applyTokens(resolveDeferralElementContent(tokens.customMessage ?? "", tokens)),
        );
        if (deferralSupplementalMessageEmpty(html)) return null;
        return `<p class="m-0 leading-snug whitespace-pre-wrap" style="font-size:${fontSize}px;color:#eee">${html}</p>`;
      }
      case "request_id": {
        const display = resolveDeferralIdDisplay(tokens);
        if (!display) return null;
        return `<p class="m-0 leading-snug whitespace-nowrap" style="font-size:${fontSize}px;color:#eee"><strong>${display.label}:</strong> <code style="letter-spacing:2px;background-color:#ff7f5059;padding:2px 4px;border-radius:6px;font-size:inherit">${display.id}</code></p>`;
      }
      case "ban_id":
        return `<p class="m-0 leading-snug whitespace-nowrap" style="font-size:${fontSize}px;color:#eee"><strong>Ban ID:</strong> <code style="letter-spacing:2px;background-color:#ff7f5059;padding:2px 4px;border-radius:6px;font-size:inherit">${tokens.banId ?? "A12345"}</code></p>`;
      case "ban_reason":
        return `<p class="m-0 leading-snug break-words" style="font-size:${fontSize}px;color:#eee"><strong>Reason:</strong> ${tokens.banReason ?? "Example ban"}</p>`;
      case "ban_expires":
        return `<p class="m-0 leading-snug whitespace-nowrap" style="font-size:${fontSize}px;color:#eee"><strong>Expires:</strong> ${tokens.banExpires ?? "in 2 days"}</p>`;
      case "tier_name": {
        if (!template.showTierName) return null;
        return `<p class="m-0 leading-snug whitespace-nowrap" style="font-size:${fontSize}px;color:#eee"><strong>Tier:</strong> ${tokens.tierName ?? "Default"}</p>`;
      }
      case "spacer":
        return `<div class="h-full" style="min-height:8px"></div>`;
      case "divider":
        return `<hr class="m-0" style="height:0;border:0;border-top:1px solid #555;width:100%" />`;
      case "logo":
        return null;
      case "button": {
        const btn = parseDeferralButtonContent(el.content);
        const label = applyDeferralTokensPreview(btn.label, tokens, template.customPlaceholders ?? []);
        const href = sanitizeDeferralButtonUrl(
          applyDeferralTokensPreview(btn.url, tokens, template.customPlaceholders ?? []),
        );
        if (!href) {
          return `<span class="text-muted-foreground" style="font-size:${fontSize}px">Invalid button URL</span>`;
        }
        const style = buildDeferralButtonAnchorStyle(btn);
        const styleStr = Object.entries(parseContainerStyle(style))
          .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`)
          .join(";");
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="${styleStr};font-size:${fontSize}px">${label}</a>`;
      }
      case "custom_image": {
        const src = el.content?.trim();
        if (
          !src?.startsWith("data:image/png") &&
          !src?.startsWith("data:image/gif") &&
          !src?.startsWith("data:image/svg+xml")
        ) {
          return null;
        }
        return null;
      }
      default:
        return null;
    }
  }

  const TEXT_LIKE = new Set([
    "heading",
    "text",
    "paragraph",
    "custom_text",
    "request_id",
    "ban_id",
    "ban_expires",
    "tier_name",
  ]);

  export function isTextLike(type: string): boolean {
    return TEXT_LIKE.has(type);
  }
</script>

<script lang="ts">
  import { cn } from "../cn";
  import { deferralBlockLabel } from "../locale/deferralStudioLocale";
  import { t } from "../locale/locale";
  import { draggable } from "./draggable.svelte";
  import AnimatedImage from "./AnimatedImage.svelte";

  let {
    cardWidth,
    cardHeight,
    elements,
    selectedId,
    showGrid,
    snapToGrid,
    template,
    tokens,
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
    onSelect: (id: string | null) => void;
    onMoveElement: (id: string, x: number, y: number) => void;
  } = $props();

  let centerGuides = $state<CenterGuideState | null>(null);
  const contentWidth = $derived(getCanvasContentWidth(cardWidth));
  const innerHeight = $derived(cardHeight - DEFERRAL_CARD_PADDING * 2);

  const textElements = $derived.by(() =>
    elements
      .filter((e) => (e.type === "text" || e.type === "paragraph") && e.enabled !== false)
      .sort((a, b) => a.y - b.y || a.x - b.x),
  );
  const messageParts = $derived(splitCustomMessageParts(tokens.customMessage ?? ""));

  const textLineIndexFor = (el: DeferralCanvasElement): number =>
    el.type === "text" || el.type === "paragraph"
      ? textElements.findIndex((x) => x.id === el.id)
      : 0;
</script>

<div
  class="relative shrink-0"
  style="width:{cardWidth}px;margin-top:{DEFERRAL_CARD_MARGIN_TOP}px"
  onclick={() => onSelect(null)}
  onkeydown={(e) => e.key === "Escape" && onSelect(null)}
  role="presentation"
  tabindex="-1"
>
  <div
    class="relative overflow-hidden"
    style="width:{cardWidth}px;height:{cardHeight}px;background-color:rgba(30,30,30,0.5);padding:{DEFERRAL_CARD_PADDING}px;border:solid 1.5px #80282B;border-radius:8px;box-sizing:border-box"
  >
    <div class="relative" style="width:{contentWidth}px;height:{innerHeight}px;margin:0 auto">
      {#if showGrid}
        <div
          class="pointer-events-none absolute inset-0 z-0"
          style="background-image:linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px);background-size:{DEFERRAL_CANVAS_SNAP_GRID}px {DEFERRAL_CANVAS_SNAP_GRID}px"
          aria-hidden="true"
        ></div>
      {/if}
      {#if centerGuides}
        <div class="pointer-events-none absolute inset-0 z-2" aria-hidden="true">
          {#if centerGuides.vertical}
            <div
              class="absolute top-0 bottom-0"
              style="left:50%;width:0;border-left:1px solid rgba(96,165,250,0.85);transform:translateX(-50%)"
            ></div>
          {/if}
          {#if centerGuides.horizontal}
            <div
              class="absolute right-0 left-0"
              style="top:50%;height:0;border-top:1px solid rgba(96,165,250,0.85);transform:translateY(-50%)"
            ></div>
          {/if}
        </div>
      {/if}
      {#each elements as el (el.id)}
        {@const enabled = el.enabled !== false}
        {#if !enabled || el.type === "logo"}
        {:else}
          {@const size = estimateCanvasElementSize(el, contentWidth)}
          {@const width = size.width}
          {@const height = size.height}
          {@const textLike = isTextLike(el.type)}
          {@const textMaxWidth = Math.max(48, contentWidth - el.x)}
          {@const inner = renderElementInner(el, template, tokens, textLineIndexFor(el), messageParts)}
          {@const src = el.type === "custom_image" ? el.content?.trim() : undefined}
          {#if (el.type === "custom_image" && src?.startsWith("data:image")) || inner !== null}
            <div
              use:draggable={{
                element: el,
                snapToGrid,
                contentWidth,
                innerHeight,
                width: textLike ? Math.min(width, textMaxWidth) : width,
                height,
                onMove: (x, y) => onMoveElement(el.id, x, y),
                onCenterGuidesChange: (g) => (centerGuides = g),
              }}
              role="button"
              tabindex="0"
              aria-label={t("panel.card_editor.card.drag_aria", {
                type: deferralBlockLabel(t, el.type as DeferralBlockType),
              })}
              class={cn(
                "pointer-events-auto absolute cursor-grab touch-none select-none active:cursor-grabbing",
                textLike ? "block" : "inline-flex",
                selectedId === el.id
                  ? "ring-primary ring-offset-background ring-2 ring-offset-2"
                  : "hover:ring-primary/40 hover:ring-1",
              )}
              style={textLike
                ? `left:${el.x}px;top:${el.y}px;width:max-content;min-width:${Math.min(width, textMaxWidth)}px;max-width:${textMaxWidth}px;min-height:${height}px;height:auto`
                : `left:${el.x}px;top:${el.y}px;width:${width}px;height:${height}px`}
              onclick={(e) => { e.stopPropagation(); onSelect(el.id); }}
              onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(el.id); } }}
            >
              {#if el.type === "custom_image" && src?.startsWith("data:image")}
                <AnimatedImage src={src} alt="" class="pointer-events-none h-full w-full object-contain" />
              {:else}
                <div class={textLike ? "" : "h-full w-full overflow-hidden"}>
                  {@html inner}
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      {/each}
    </div>
  </div>
</div>
