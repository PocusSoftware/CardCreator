<script lang="ts">
  import { getContext } from "svelte";
  import { cn } from "../../cn";

  let {
    onclick,
    disabled = false,
    class: cls = "",
    children,
  }: {
    onclick?: (e: MouseEvent) => void;
    disabled?: boolean;
    class?: string;
    children?: import("svelte").Snippet;
  } = $props();

  const close = getContext<(val: any) => void>("dropdown-close") ?? (() => {});

  const handle = (e: MouseEvent) => {
    if (disabled) return;
    onclick?.(e);
    close(true);
  };
</script>

<button
  type="button"
  role="menuitem"
  {disabled}
  class={cn(
    "flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45",
    "hover:bg-hover hover:text-foreground",
    cls,
  )}
  onclick={handle}
>
  {@render children?.()}
</button>
