<script lang="ts">
  import { previewState, closePreview, downloadPublishedCard } from "../preview.svelte";
  import { t } from "../locale/locale";
  import Button from "./primitives/Button.svelte";
  import Modal from "./primitives/Modal.svelte";
  import Icon from "./Icon.svelte";
</script>

<Modal open={previewState.open} onClose={closePreview} labelledby="preview-title" class="max-w-4xl">
  <div class="flex items-center justify-between gap-4 border-b px-5 py-3">
    <div class="min-w-0">
      <p class="eyebrow">{t("panel.card_editor.preview.eyebrow")}</p>
      <h2 id="preview-title" class="truncate text-sm font-semibold">
        {previewState.scenarioId}
      </h2>
    </div>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="secondary" onclick={downloadPublishedCard}>
        <Icon name="download" class="size-3.5" />
        {t("panel.card_editor.preview.download_html")}
      </Button>
      <Button size="icon" variant="ghost" onclick={closePreview} aria-label={t("panel.common.close")}>
        <Icon name="x" class="size-4" />
      </Button>
    </div>
  </div>
  <div class="bg-canvas deferral-card flex min-h-64 flex-1 items-center justify-center overflow-auto rounded-b-[var(--radius-card)] p-8">
    {@html previewState.html}
  </div>
</Modal>
