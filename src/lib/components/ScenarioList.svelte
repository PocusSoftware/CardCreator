<script lang="ts">
  import { cn } from "../cn";
  import { t } from "../locale/locale";
  import { deferralScenarioLabel } from "../locale/deferralStudioLocale";
  import { DEFERRAL_SCENARIO_META } from "../studioState.svelte";

  let {
    scenarioId,
    dirtyScenarioIds,
    onSelect,
  }: {
    scenarioId: string | null;
    dirtyScenarioIds: string[];
    onSelect: (id: string) => void;
  } = $props();

  const GROUP_ORDER = ["ban", "whitelist", "queue", "general"] as const;

  const groups = $derived(
    GROUP_ORDER.map((group) => ({
      group,
      items: DEFERRAL_SCENARIO_META.filter((s) => s.group === group).map((s) => {
        const full = deferralScenarioLabel(t, s.id, s.label);
        const sep = full.indexOf(": ");
        const short = sep >= 0 ? full.slice(sep + 2) : full;
        return { id: s.id, label: short, full };
      }),
    })).filter((g) => g.items.length),
  );
</script>

<nav class="flex flex-col gap-4" aria-label={t("panel.card_editor.app.scenarios_heading")}>
  {#each groups as { group, items } (group)}
    <div>
      <p class="eyebrow px-2 pb-1.5">{t(`panel.card_editor.app.groups.${group}`)}</p>
      <ul class="flex flex-col gap-px">
        {#each items as item (item.id)}
          {@const active = item.id === scenarioId}
          {@const dirty = dirtyScenarioIds.includes(item.id)}
          <li>
            <button
              type="button"
              title={item.full}
              aria-current={active ? "page" : undefined}
              class={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150",
                active
                  ? "bg-hover text-foreground font-medium"
                  : "text-muted-foreground hover:bg-hover hover:text-foreground",
              )}
              onclick={() => onSelect(item.id)}
            >
              <span class="min-w-0 flex-1 truncate first-letter:uppercase">{item.label}</span>
              {#if dirty}
                <span class="bg-warning size-1.5 shrink-0 rounded-full" aria-label={t("panel.card_editor.app.unsaved")}></span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</nav>
