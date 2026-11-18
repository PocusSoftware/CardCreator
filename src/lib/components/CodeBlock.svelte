<script lang="ts">
  import Icon from "./Icon.svelte";
  import { cn } from "../cn";

  let {
    code,
    copyText,
    lang,
    class: cls = "",
  }: { code: string; copyText?: string; lang?: string; class?: string } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? code);
      copied = true;
      clearTimeout(timer);
      timer = setTimeout(() => (copied = false), 1400);
    } catch {
      copied = false;
    }
  };
</script>

<div class={cn("group relative overflow-hidden rounded-[var(--radius-control)] border bg-[#0f1011]", cls)}>
  {#if lang}
    <div class="flex h-8 items-center justify-between border-b px-3">
      <span class="text-subtle-foreground font-mono text-[10px] tracking-wider uppercase">{lang}</span>
    </div>
  {/if}
  <button
    type="button"
    class={cn(
      "text-subtle-foreground hover:text-foreground hover:bg-hover absolute right-1.5 grid size-7 place-items-center rounded-md transition-colors duration-150",
      lang ? "top-0.5" : "top-1.5",
    )}
    aria-label={copied ? "Copied" : "Copy code"}
    onclick={copy}
  >
    <Icon name={copied ? "check" : "copy"} class={cn("size-3.5", copied && "text-success")} />
  </button>
  <pre class="max-h-96 overflow-auto p-3 pr-10 font-mono text-[12.5px] leading-relaxed text-[#dcdedf]"><code>{code}</code></pre>
</div>
