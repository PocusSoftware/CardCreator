<script lang="ts">
  import { toasts, dismiss, type ToastType } from "../../toast.svelte";
  import { cn } from "../../cn";

  const BAR: Record<ToastType, string> = {
    default: "border-primary/25 bg-secondary text-secondary-foreground",
    loading: "border-primary/25 bg-secondary text-secondary-foreground",
    info: "border-info/70 bg-info-hint text-info-foreground",
    success: "border-success/70 bg-success-hint text-success-foreground",
    warning: "border-warning/70 bg-warning-hint text-warning-foreground",
    error: "border-destructive/70 bg-destructive-hint text-destructive-foreground",
  };
</script>

<div class="pointer-events-none fixed top-4 right-4 z-[90] flex w-full max-w-md flex-col gap-2">
  {#each toasts as item (item.id)}
    <div
      class={cn(
        "pointer-events-auto flex items-start justify-between gap-3 rounded-xl border p-3 pr-10 shadow-lg",
        BAR[item.type],
      )}
      role="status"
    >
      <div class="min-w-0">
        {#if item.title}
          <p class="text-sm font-semibold">{item.title}</p>
        {/if}
        <p class={cn("text-sm", item.title ? "mt-0.5 opacity-90" : "")}>{item.msg}</p>
      </div>
      <button
        type="button"
        class="absolute top-2 right-2 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
        onclick={() => dismiss(item.id)}
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>
