<script lang="ts">
  import { setContext } from "svelte";
  import { cn } from "../../cn";
  import { portal } from "../portal";

  let {
    align = "start",
    trigger,
    children,
  }: {
    align?: "start" | "end";
    trigger?: import("svelte").Snippet;
    children?: import("svelte").Snippet;
  } = $props();

  let open = $state(false);
  let triggerEl: HTMLElement | null = null;
  let panelPos = $state<{ top: number; left: number }>({ top: 0, left: 0 });

  const close = () => (open = false);
  setContext("dropdown-close", close);

  const reposition = () => {
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    const left = align === "end" ? r.right - 160 : r.left;
    panelPos = { top: r.bottom + 4, left: Math.max(8, left) };
  };

  const openMenu = () => {
    open = true;
    reposition();
  };

  $effect(() => {
    if (!open) return;
    const onWinClick = (e: MouseEvent) => {
      const t = e.target as Node;
      const panel = document.querySelector('[data-dropdown-panel]');
      if (triggerEl && !triggerEl.contains(t) && !panel?.contains(t)) open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open = false;
    };
    const onScrollOrResize = () => reposition();
    window.addEventListener("click", onWinClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("click", onWinClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  });
</script>

<div class="relative inline-block">
  <div
    bind:this={triggerEl}
    onclick={(e) => { e.stopPropagation(); open ? (open = false) : openMenu(); }}
    onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); open ? (open = false) : openMenu(); } }}
    role="button"
    tabindex="0"
  >
    {@render trigger?.()}
  </div>
</div>

{#if open}
  <div
    use:portal
    data-dropdown-panel
    class="bg-popover text-popover-foreground fixed z-50 min-w-40 overflow-auto rounded-md border p-1 shadow-lg"
    style="top:{panelPos.top}px;left:{panelPos.left}px"
    role="menu"
  >
    {@render children?.()}
  </div>
{/if}
