<script lang="ts">
  import { cn } from "../../cn";
  import type { HTMLInputAttributes } from "svelte/elements";

  let {
    class: cls = "",
    type = "text",
    value = $bindable(),
    ...rest
  }: HTMLInputAttributes & { class?: string; value?: string | number } = $props();
</script>

<input
  {type}
  bind:value
  class={cn(
    "flex w-full rounded-[var(--radius-control)] border bg-background h-9 px-3 text-sm text-foreground transition-colors duration-150 placeholder:text-subtle-foreground hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50",
    cls,
  )}
  {...rest}
/>
