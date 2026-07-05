<script lang="ts">
  import { cn } from "../../cn";

  let {
    class: cls = "",
    children,
  }: {
    class?: string;
    children?: import("svelte").Snippet;
  } = $props();
</script>

<div class={cn("overflow-auto", cls)}>
  {@render children?.()}
</div>
