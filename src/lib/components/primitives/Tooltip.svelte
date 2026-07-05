<script lang="ts">
  import { cn } from "../../cn";
  import { portal } from "../portal";

  let {
    label,
    side = "bottom",
    children,
  }: {
    label: string;
    side?: "top" | "bottom";
    children?: import("svelte").Snippet;
  } = $props();

  let open = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let triggerEl: HTMLElement | null = null;
  let pos = $state<{ top: number; left: number }>({ top: 0, left: 0 });

  const reposition = () => {
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    pos = {
      top: side === "bottom" ? r.bottom + 6 : r.top - 6,
      left: r.left + r.width / 2,
    };
  };

  const show = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      reposition();
      open = true;
    }, 200);
  };
  const hide = () => {
    if (timer) clearTimeout(timer);
    open = false;
  };
</script>

<span
  bind:this={triggerEl}
  class="relative inline-flex"
  role="group"
  onmouseenter={show}
  onmouseleave={hide}
  onfocusin={() => { reposition(); open = true; }}
  onfocusout={hide}
>
  {@render children?.()}
</span>

{#if open}
  <div
    use:portal
    role="tooltip"
    class={cn(
      "bg-popover text-popover-foreground pointer-events-none fixed z-50 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs shadow-md",
      side === "bottom" ? "translate-y-0" : "-translate-y-full",
    )}
    style="top:{pos.top}px;left:{pos.left}px"
  >
    {label}
  </div>
{/if}
