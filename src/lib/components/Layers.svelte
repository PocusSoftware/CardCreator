<script lang="ts">
  import { cn } from "../cn";
  import { t } from "../locale/locale";
  import { deferralBlockLabel } from "../locale/deferralStudioLocale";
  import Icon from "./Icon.svelte";
  import type { DeferralCanvasElement } from "@shared/deferralCardCanvas";
  import type { DeferralBlockType } from "@shared/deferralCardLayout";

  let {
    elements,
    selectedId,
    onSelect,
    onToggleVisible,
    onReorder,
  }: {
    elements: DeferralCanvasElement[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onToggleVisible: (id: string) => void;
    onReorder: (elements: DeferralCanvasElement[]) => void;
  } = $props();

  const displayIds = $derived.by(() => [...elements].reverse().map((el) => el.id));
  const elementById = $derived.by(() => new Map(elements.map((el) => [el.id, el])));

  let dragId = $state<string | null>(null);

  const onDragStart = (e: DragEvent, id: string) => {
    dragId = id;
    e.dataTransfer?.setData("text/plain", id);
  };

  const onDragOver = (e: DragEvent, overId: string) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: DragEvent, overId: string) => {
    e.preventDefault();
    const fromId = dragId ?? e.dataTransfer?.getData("text/plain");
    dragId = null;
    if (!fromId || fromId === overId) return;
    const oldIndex = displayIds.indexOf(fromId);
    const newIndex = displayIds.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(displayIds, oldIndex, newIndex);
    const byId = new Map(elements.map((el) => [el.id, el]));
    const reordered = [...moved]
      .reverse()
      .map((id) => byId.get(id))
      .filter((el): el is DeferralCanvasElement => !!el);
    onReorder(reordered);
  };

  function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const out = [...arr];
    const [item] = out.splice(from, 1);
    out.splice(to, 0, item);
    return out;
  }
</script>

{#if !elements.length}
  <p class="text-muted-foreground text-xs">{t("panel.card_editor.layers.empty")}</p>
{:else}
  <ol class="flex flex-col gap-0.5">
    {#each displayIds as id (id)}
      {@const el = elementById.get(id)}
      {#if el}
        {@const hidden = el.enabled === false}
        <li
          draggable="true"
          ondragstart={(e) => onDragStart(e, el.id)}
          ondragover={(e) => onDragOver(e, el.id)}
          ondrop={(e) => onDrop(e, el.id)}
          class={cn(
            "flex w-full min-w-0 items-center gap-1 rounded-md px-1 py-1 text-xs transition-colors",
            "cursor-grab active:cursor-grabbing",
            selectedId === el.id
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            hidden && "opacity-50",
          )}
        >
          <button
            type="button"
            class="min-w-0 flex-1 truncate text-left"
            onclick={() => onSelect(el.id)}
          >
            {deferralBlockLabel(t, el.type as DeferralBlockType)}
          </button>
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground shrink-0"
            aria-label={hidden
              ? t("panel.card_editor.layers.show_element")
              : t("panel.card_editor.layers.hide_element")}
            onclick={() => onToggleVisible(el.id)}
          >
            {#if hidden}
              <Icon name="eye-off" class="size-3.5" />
            {:else}
              <Icon name="eye" class="size-3.5" />
            {/if}
          </button>
        </li>
      {/if}
    {/each}
  </ol>
{/if}
