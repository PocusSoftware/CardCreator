<script lang="ts">
  import { t } from "../locale/locale";
  import { templateWithCanvas } from "@shared/deferralCardCanvas";
  import type { DeferralCardTemplate } from "@shared/deferralCardTypes";
  import type { DeferralCardTokens } from "@shared/deferralCardRender";
  import type { DeferralScenarioId } from "../studioState.svelte";
  import { templatesForScenario, type CardTemplate } from "../templates";
  import Modal from "./primitives/Modal.svelte";
  import Button from "./primitives/Button.svelte";
  import Card from "./Card.svelte";
  import Icon from "./Icon.svelte";

  let {
    open,
    onClose,
    scenarioId,
    scenarioLabel,
    baseTemplate,
    tokens,
    onApply,
  }: {
    open: boolean;
    onClose: () => void;
    scenarioId: string | null;
    scenarioLabel: string;
    baseTemplate: DeferralCardTemplate | null;
    tokens: DeferralCardTokens;
    onApply: (tpl: CardTemplate) => void;
  } = $props();

  const PREVIEW_WIDTH = 392;
  const CARD_MARGIN_TOP = 25;

  const items = $derived.by(() => {
    if (!open || !scenarioId || !baseTemplate) return [];
    return templatesForScenario(scenarioId).map((tpl) => {
      const canvas = tpl.build(scenarioId as DeferralScenarioId, baseTemplate.title);
      const scale = Math.min(1, PREVIEW_WIDTH / canvas.width);
      return {
        tpl,
        canvas,
        scale,
        template: templateWithCanvas(baseTemplate, canvas),
      };
    });
  });

  const noop = () => {};
</script>

<Modal {open} {onClose} labelledby="templates-title" class="max-w-[920px]">
  <div class="flex items-start justify-between gap-4 border-b px-6 py-4">
    <div class="min-w-0">
      <p class="eyebrow">{t("panel.card_editor.templates.eyebrow")}</p>
      <h2 id="templates-title" class="mt-1 text-lg font-semibold tracking-tight">
        {t("panel.card_editor.templates.title")}
      </h2>
      <p class="text-muted-foreground mt-1 text-sm text-pretty">
        {t("panel.card_editor.templates.subtitle", { scenario: scenarioLabel })}
      </p>
    </div>
    <Button size="icon" variant="ghost" onclick={onClose} aria-label={t("panel.common.close")}>
      <Icon name="x" class="size-4" />
    </Button>
  </div>

  <div class="min-h-0 flex-1 overflow-y-auto p-6">
    {#if !items.length}
      <p class="text-muted-foreground text-sm">{t("panel.card_editor.templates.empty")}</p>
    {:else}
      <ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
        {#each items as item (item.tpl.id)}
          <li class="bg-background group flex flex-col overflow-hidden rounded-[var(--radius-card)] border transition-colors duration-150 hover:border-border-strong">
            <div
              class="bg-canvas relative flex items-start justify-center overflow-hidden border-b px-4 pb-4"
              style:height="{Math.round((item.canvas.height + CARD_MARGIN_TOP) * item.scale) + 16}px"
            >
              <div
                class="deferral-card pointer-events-none origin-top"
                style:transform="scale({item.scale})"
                style:width="{item.canvas.width}px"
                inert
              >
                <Card
                  cardWidth={item.canvas.width}
                  cardHeight={item.canvas.height}
                  elements={item.canvas.elements}
                  selectedId={null}
                  showGrid={false}
                  snapToGrid={false}
                  template={item.template}
                  {tokens}
                  onSelect={noop}
                  onMoveElement={noop}
                />
              </div>
            </div>
            <div class="flex flex-1 items-end justify-between gap-4 p-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold">{item.tpl.name}</h3>
                  <span class="bg-muted text-subtle-foreground rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                    {t(`panel.card_editor.templates.categories.${item.tpl.category}`)}
                  </span>
                </div>
                <p class="text-muted-foreground mt-1 text-xs leading-relaxed text-pretty">{item.tpl.description}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                class="shrink-0"
                onclick={() => {
                  onApply(item.tpl);
                  onClose();
                }}
              >
                {t("panel.card_editor.templates.apply")}
              </Button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</Modal>
