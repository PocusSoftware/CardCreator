<script lang="ts">
  import { cn } from "../../cn";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  let {
    class: cls = "",
    value = $bindable(),
    minHeight = 52,
    maxHeight = Number.MAX_SAFE_INTEGER,
    ...rest
  }: HTMLTextareaAttributes & {
    class?: string;
    value?: string;
    minHeight?: number;
    maxHeight?: number;
  } = $props();

  let el: HTMLTextAreaElement | null = null;

  $effect(() => {
    void value;
    const ta = el;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(maxHeight, Math.max(minHeight, ta.scrollHeight));
    ta.style.height = `${next}px`;
  });
</script>

<textarea
  bind:this={el}
  bind:value
  class={cn(
    "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
    "bg-black/30 placeholder:opacity-50",
    cls,
  )}
  {...rest}
></textarea>
