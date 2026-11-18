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
    "flex w-full rounded-[var(--radius-control)] border bg-background px-3 py-2 font-mono text-[13px] leading-relaxed text-foreground resize-none transition-colors duration-150 placeholder:text-subtle-foreground hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50",
    cls,
  )}
  {...rest}
></textarea>
