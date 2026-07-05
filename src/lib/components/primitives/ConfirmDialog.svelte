<script lang="ts">
  import { confirmState, resolveConfirm } from "../../dialog.svelte";
  import Button from "./Button.svelte";
  import { t } from "../../locale/locale";

  const onCancel = () => resolveConfirm(false);
  const onConfirm = () => resolveConfirm(true);
</script>

{#if confirmState.open && confirmState.cfg}
  <div
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
    onclick={onCancel}
    onkeydown={(e) => e.key === "Escape" && onCancel()}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="bg-card text-card-foreground w-full max-w-md rounded-xl border p-6 shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h2 class="text-lg font-semibold">{confirmState.cfg.title}</h2>
      <p class="text-muted-foreground mt-2 text-sm leading-relaxed">{confirmState.cfg.message}</p>
      <div class="mt-6 flex justify-end gap-2">
        <Button variant="ghost-secondary" size="sm" onclick={onCancel}>
          {t("panel.common.cancel")}
        </Button>
        <Button
          variant={confirmState.cfg.confirmBtnVariant === "destructive" ? "destructive" : "default"}
          size="sm"
          onclick={onConfirm}
        >
          {confirmState.cfg.actionLabel}
        </Button>
      </div>
    </div>
  </div>
{/if}
