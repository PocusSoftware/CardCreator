<script lang="ts" module>
  export type SelectOption = { value: string; label: string; group?: string };
</script>

<script lang="ts">
  import { cn } from "../../cn";
  import { portal } from "../portal";

  let {
    options = [],
    value = $bindable(),
    placeholder = "",
    class: cls = "",
    id,
    onValueChange,
  }: {
    options: SelectOption[];
    value?: string;
    placeholder?: string;
    class?: string;
    id?: string;
    onValueChange?: (v: string) => void;
  } = $props();

  let open = $state(false);
  let triggerEl: HTMLButtonElement | null = null;
  let panelPos = $state<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const groups = $derived.by(() => {
    const map = new Map<string, SelectOption[]>();
    for (const o of options) {
      const g = o.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(o);
    }
    return [...map.entries()];
  });

  const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);

  const choose = (v: string) => {
    value = v;
    onValueChange?.(v);
    open = false;
  };

  const reposition = () => {
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    panelPos = { top: r.bottom + 4, left: r.left, width: r.width };
  };

  const openMenu = () => {
    open = true;
    reposition();
  };

  let cleanup: (() => void) | undefined;
  $effect(() => {
    if (!open) return;
    const onWinClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerEl && !triggerEl.contains(t) && !document.querySelector(`[data-select-panel="${id ?? ""}"]`)?.contains(t)) {
        open = false;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open = false;
    };
    const onScrollOrResize = () => reposition();
    window.addEventListener("click", onWinClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    cleanup = () => {
      window.removeEventListener("click", onWinClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
    return cleanup;
  });
</script>

<div class={cn("relative", cls)}>
  <button
    {id}
    bind:this={triggerEl}
    type="button"
    class="border-input bg-background ring-offset-background flex h-full w-full items-center justify-between rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
    onclick={() => (open ? (open = false) : openMenu())}
  >
    <span class={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>{selectedLabel}</span>
    <svg class="text-muted-foreground size-4 opacity-50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</div>

{#if open}
  <div
    use:portal
    data-select-panel={id ?? ""}
    class="bg-popover text-popover-foreground fixed z-50 max-h-72 overflow-auto rounded-md border p-1 shadow-lg"
    style="top:{panelPos.top}px;left:{panelPos.left}px;width:{panelPos.width}px"
    role="listbox"
  >
    {#each groups as [group, opts] (group)}
      {#if group}
        <div class="text-muted-foreground px-2 py-1.5 text-xs font-semibold tracking-wide uppercase">{group}</div>
      {/if}
      {#each opts as o (o.value)}
        <button
          type="button"
          role="option"
          aria-selected={value === o.value}
          class={cn(
            "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm outline-hidden",
            value === o.value ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/60",
          )}
          onclick={() => choose(o.value)}
        >
          {o.label}
        </button>
      {/each}
    {/each}
  </div>
{/if}
