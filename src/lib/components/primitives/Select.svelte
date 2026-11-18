<script lang="ts" module>
  export type SelectOption = { value: string; label: string; group?: string; disabled?: boolean };
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
    class="flex h-full w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border bg-background px-3 text-sm transition-colors duration-150 hover:border-border-strong"
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={() => (open ? (open = false) : openMenu())}
  >
    <span class={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>{selectedLabel}</span>
    <svg class="text-subtle-foreground size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</div>

{#if open}
  <div
    use:portal
    data-select-panel={id ?? ""}
    class="bg-popover text-popover-foreground fixed z-50 max-h-80 overflow-auto rounded-[var(--radius-control)] border p-1 shadow-xl shadow-black/40"
    style="top:{panelPos.top}px;left:{panelPos.left}px;width:{panelPos.width}px"
    role="listbox"
  >
    {#each groups as [group, opts] (group)}
      {#if group}
        <div class="eyebrow px-2 pt-2 pb-1">{group}</div>
      {/if}
      {#each opts as o (o.value)}
        <button
          type="button"
          role="option"
          aria-selected={value === o.value}
          aria-disabled={o.disabled}
          disabled={o.disabled}
          class={cn(
            "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm",
            o.disabled
              ? "text-subtle-foreground cursor-not-allowed"
              : value === o.value
                ? "bg-hover text-foreground cursor-pointer"
                : "text-muted-foreground hover:bg-hover hover:text-foreground cursor-pointer",
          )}
          onclick={() => {
            if (o.disabled) return;
            choose(o.value);
          }}
        >
          {o.label}
        </button>
      {/each}
    {/each}
  </div>
{/if}
