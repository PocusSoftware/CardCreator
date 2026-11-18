<script lang="ts">
  import { t } from "../locale/locale";
  import Button from "./primitives/Button.svelte";
  import DropdownMenu from "./primitives/DropdownMenu.svelte";
  import DropdownItem from "./primitives/DropdownItem.svelte";
  import DropdownSeparator from "./primitives/DropdownSeparator.svelte";
  import Icon from "./Icon.svelte";

  let {
    scenarioLabel,
    scenarioDescription,
    hasScenario,
    canUseTemplates,
    isSaving,
    isCurrentDirty,
    onOpenTemplates,
    onOpenDocs,
    onExportAll,
    onExportAllLua,
    onExportScenario,
    onExportScenarioLua,
    onImport,
    onRestoreDefault,
    onSave,
  }: {
    scenarioLabel: string | null;
    scenarioDescription: string | null;
    hasScenario: boolean;
    canUseTemplates: boolean;
    isSaving: boolean;
    isCurrentDirty: boolean;
    onOpenTemplates: () => void;
    onOpenDocs: () => void;
    onExportAll: () => void;
    onExportAllLua: () => void;
    onExportScenario: () => void;
    onExportScenarioLua: () => void;
    onImport: () => void;
    onRestoreDefault: () => void;
    onSave: () => void;
  } = $props();
</script>

<header class="bg-background/80 flex h-14 shrink-0 items-center gap-4 border-b px-4 backdrop-blur">
  <div class="flex w-[248px] shrink-0 items-center">
    <div class="min-w-0 leading-tight">
      <p class="truncate text-sm font-semibold tracking-tight">{t("panel.card_editor.app.title")}</p>
      <p class="text-subtle-foreground truncate font-mono text-[10px] tracking-wider uppercase">
        {t("panel.card_editor.app.subtitle")}
      </p>
    </div>
  </div>

  <div class="hidden min-w-0 flex-1 items-center gap-2 md:flex">
    {#if scenarioLabel}
      <h1 class="truncate text-sm font-medium">{scenarioLabel}</h1>
      {#if isCurrentDirty}
        <span class="bg-warning/10 text-warning inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <span class="bg-warning size-1.5 rounded-full"></span>
          {t("panel.card_editor.app.unsaved")}
        </span>
      {/if}
      {#if scenarioDescription}
        <p class="text-subtle-foreground hidden truncate text-xs xl:block">{scenarioDescription}</p>
      {/if}
    {/if}
  </div>

  <div class="ml-auto flex shrink-0 items-center gap-1.5">
    <Button variant="ghost" size="sm" onclick={onOpenDocs}>
      <Icon name="book-open" class="size-4" />
      <span class="hidden sm:inline">{t("panel.card_editor.canvas.docs_title")}</span>
    </Button>
    <Button variant="secondary" size="sm" disabled={!canUseTemplates} onclick={onOpenTemplates}>
      <Icon name="layout-template" class="size-4" />
      <span class="hidden sm:inline">{t("panel.card_editor.templates.open")}</span>
    </Button>

    <DropdownMenu align="end">
      {#snippet trigger()}
        <Button variant="secondary" size="sm" tabindex={-1}>
          {t("panel.card_editor.toolbar.file")}
          <Icon name="chevron-down" class="text-subtle-foreground size-3.5" />
        </Button>
      {/snippet}
      <DropdownItem disabled={!hasScenario} onclick={onExportScenario}>
        <Icon name="download" class="size-4" />
        {t("panel.card_editor.toolbar.export_scenario")}
      </DropdownItem>
      <DropdownItem disabled={!hasScenario} onclick={onExportScenarioLua}>
        <Icon name="download" class="size-4" />
        {t("panel.card_editor.toolbar.export_scenario_lua")}
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem onclick={onExportAll}>
        <Icon name="download" class="size-4" />
        {t("panel.card_editor.toolbar.export_all")}
      </DropdownItem>
      <DropdownItem onclick={onExportAllLua}>
        <Icon name="download" class="size-4" />
        {t("panel.card_editor.toolbar.export_all_lua")}
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem onclick={onImport}>
        <Icon name="upload" class="size-4" />
        {t("panel.card_editor.toolbar.import")}
      </DropdownItem>
      <DropdownItem disabled={!hasScenario} onclick={onRestoreDefault}>
        <Icon name="rotate-ccw" class="size-4" />
        {t("panel.card_editor.toolbar.restore_default")}
      </DropdownItem>
    </DropdownMenu>

    <Button size="sm" onclick={onSave} disabled={isSaving || !hasScenario || !isCurrentDirty}>
      {#if isCurrentDirty}
        <Icon name="save" class="size-3.5" />
        {t("panel.card_editor.toolbar.save_card")}
      {:else}
        <Icon name="check" class="size-3.5" />
        {t("panel.card_editor.toolbar.saved")}
      {/if}
    </Button>
  </div>
</header>
