<script lang="ts">
  import { previewState, closePreview, downloadPublishedCard } from "../preview.svelte";
  import { t } from "../locale/locale";
  import Button from "./primitives/Button.svelte";
  import Icon from "./Icon.svelte";
</script>

{#if previewState.open}
  <div
    class="fixed inset-0 z-95 flex flex-col items-center justify-center bg-black/70 p-6"
    onclick={closePreview}
    onkeydown={(e) => e.key === "Escape" && closePreview()}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="bg-card text-card-foreground flex w-full max-w-3xl flex-col rounded-xl border shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-sm font-semibold">
          {t("panel.routes.card_editor")} — {previewState.scenarioId}
        </h2>
        <div class="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onclick={downloadPublishedCard}>
            <Icon name="download" class="mr-1.5 size-3.5" />
            {t("panel.card_editor.toolbar.export_scenario")}
          </Button>
          <Button type="button" size="icon" variant="ghost" onclick={closePreview} aria-label={t("panel.common.close")}>
            <Icon name="x" class="size-4" />
          </Button>
        </div>
      </div>
      <div class="bg-background flex max-h-[80vh] items-center justify-center overflow-auto p-8">
        {@html previewState.html}
      </div>
    </div>
  </div>
{/if}
