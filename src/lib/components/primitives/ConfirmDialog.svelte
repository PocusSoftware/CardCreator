<script lang="ts">
  import { confirmState, resolveConfirm } from "../../dialog.svelte";
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import { t } from "../../locale/locale";

  const onCancel = () => resolveConfirm(false);
  const onConfirm = () => resolveConfirm(true);
</script>

<Modal open={confirmState.open && !!confirmState.cfg} onClose={onCancel} labelledby="confirm-title" zIndex={130} class="max-w-md">
  {#if confirmState.cfg}
    <div class="p-6">
      <h2 id="confirm-title" class="text-lg font-semibold tracking-tight">{confirmState.cfg.title}</h2>
      <p class="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">{confirmState.cfg.message}</p>
      <div class="mt-6 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onclick={onCancel}>
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
  {/if}
</Modal>
