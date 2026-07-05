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
    "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
    "bg-black/30 placeholder:opacity-50",
    cls,
  )}
  {...rest}
/>
