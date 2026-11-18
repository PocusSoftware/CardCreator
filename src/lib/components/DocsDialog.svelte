<script lang="ts">
  import { t } from "../locale/locale";
  import { deferralBlockLabel } from "../locale/deferralStudioLocale";
  import { exportDeferralScenario, exportDeferralScenarioAsLua } from "@shared/deferralCardExport";
  import { DEFAULT_DEFERRAL_BUTTON_CONTENT } from "@shared/deferralCardButton";
  import type { DeferralCardsConfig } from "@shared/deferralCardTypes";
  import {
    DEFERRAL_PNG_MAX_BYTES,
    DEFERRAL_SVG_MAX_BYTES,
    type DeferralBlockType,
  } from "../studioState.svelte";
  import { CARD_TEMPLATES } from "../templates";
  import Modal from "./primitives/Modal.svelte";
  import Button from "./primitives/Button.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import Icon from "./Icon.svelte";

  let {
    open,
    onClose,
    config,
    scenarioId,
    blockTypes,
  }: {
    open: boolean;
    onClose: () => void;
    config: DeferralCardsConfig;
    scenarioId: string | null;
    blockTypes: DeferralBlockType[];
  } = $props();

  const SECTIONS = [
    { id: "start", title: "Getting started" },
    { id: "elements", title: "Elements" },
    { id: "placeholders", title: "Placeholders" },
    { id: "formatting", title: "Formatting" },
    { id: "buttons", title: "Buttons and images" },
    { id: "templates", title: "Templates" },
    { id: "export", title: "Saving and exporting" },
    { id: "lua", title: "Using exports in Lua" },
    { id: "shortcuts", title: "Shortcuts" },
  ] as const;

  const PLACEHOLDERS: { token: string; text: string }[] = [
    { token: "{customMessage}", text: "The reason or message passed in for this scenario." },
    { token: "{serverName}", text: "Your server name." },
    { token: "{playerName}", text: "Name of the connecting player." },
    { token: "{discordInvite}", text: "The Discord invite link from your config." },
    { token: "{guildName}", text: "Name of your Discord server." },
    { token: "{requestId}", text: "Whitelist request ID (pending approval only)." },
    { token: "{tierName}", text: "Whitelist tier name, when tiers are enabled." },
    { token: "{banReason}", text: "Why the player was banned." },
    { token: "{banExpires}", text: "Time left on a temporary ban." },
    { token: "{banId}", text: "The ban action ID." },
    { token: "{banDate}", text: "When the ban was issued." },
    { token: "{banAuthor}", text: "Who issued the ban." },
    { token: "{queuePosition}", text: "Position in the connection queue." },
    { token: "{queueSize}", text: "Total players waiting in the queue." },
    { token: "{queueEta}", text: "Estimated wait time." },
  ];

  const SHORTCUTS: { keys: string[]; text: string }[] = [
    { keys: ["⌘/Ctrl", "Z"], text: "Undo" },
    { keys: ["⌘/Ctrl", "⇧", "Z"], text: "Redo (Ctrl+Y works too)" },
    { keys: ["Delete"], text: "Remove the focused element or layer" },
    { keys: ["Enter"], text: "Select the focused element" },
    { keys: ["Esc"], text: "Deselect, or close a dialog" },
  ];

  const SNIPPET_PLACEHOLDERS = `Welcome back, {playerName}!
You are #{queuePosition} of {queueSize}. Estimated wait: {queueEta}
Appeal on {discordInvite} and include <codeid>{banId}</codeid>`;

  const SNIPPET_FORMATTING = `<strong>Ban reason:</strong> {banReason}<br>
Use <code>/report</code> in game to reach staff.
Your request ID is <codeid>{requestId}</codeid>.
Join <guildname>{guildName}</guildname> to get whitelisted.`;

  const SNIPPET_BUTTON = JSON.stringify(DEFAULT_DEFERRAL_BUTTON_CONTENT, null, 2);

  const SNIPPET_LUA = `local RESOURCE <const> = GetCurrentResourceName()
local CARDS_FILE <const> = 'cards/deferral-cards-all.lua'

---@return table?
local function loadDeferralCards()
    local raw <const> = LoadResourceFile(RESOURCE, CARDS_FILE)
    if not raw then return end
    local chunk <const> = load(raw, ('@%s/%s'):format(RESOURCE, CARDS_FILE), 't')
    return chunk and chunk()
end

local cards <const> = loadDeferralCards()
print(cards?.scenarios?.ban_temporary?.title)`;

  const SNIPPET_LUA_JSON = `local raw <const> = LoadResourceFile(GetCurrentResourceName(), 'cards/deferral-ban_temporary.json')
local file <const> = raw and json.decode(raw)
local canvas <const> = file?.template?.layout?.canvas

print(canvas?.width, canvas?.height, canvas and #canvas.elements)`;

  const truncateStrings = (value: unknown): unknown => {
    if (typeof value === "string") return value.length > 96 ? `${value.slice(0, 96)}…` : value;
    if (Array.isArray(value)) return value.map(truncateStrings);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, truncateStrings(v)]));
    }
    return value;
  };

  const exports = $derived.by(() => {
    if (!open || !scenarioId) return null;
    try {
      const file = exportDeferralScenario(config, scenarioId);
      return {
        json: JSON.stringify(file, null, 2),
        jsonShown: JSON.stringify(truncateStrings(file), null, 2),
        lua: exportDeferralScenarioAsLua(config, scenarioId),
      };
    } catch {
      return null;
    }
  });

  let activeId = $state<string>(SECTIONS[0].id);
  let scroller: HTMLElement | null = $state(null);

  const jump = (id: string) => {
    activeId = id;
    scroller?.querySelector(`#docs-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onScroll = () => {
    if (!scroller) return;
    const top = scroller.getBoundingClientRect().top + 24;
    let current: string = SECTIONS[0].id;
    for (const s of SECTIONS) {
      const el = scroller.querySelector(`#docs-${s.id}`);
      if (el && el.getBoundingClientRect().top <= top) current = s.id;
    }
    activeId = current;
  };

  const kb = (n: number) => Math.round(n / 1024);
</script>

{#snippet heading(id: string, title: string)}
  <h3 id="docs-{id}" class="scroll-mt-6 text-base font-semibold tracking-tight">{title}</h3>
{/snippet}

<Modal {open} {onClose} labelledby="docs-title" variant="sheet" class="max-w-4xl">
  <div class="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-5">
    <div class="flex items-center gap-2.5">
      <Icon name="book-open" class="text-primary size-4" />
      <h2 id="docs-title" class="text-sm font-semibold">Documentation</h2>
    </div>
    <Button size="icon" variant="ghost" onclick={onClose} aria-label={t("panel.common.close")}>
      <Icon name="x" class="size-4" />
    </Button>
  </div>

  <div class="flex min-h-0 flex-1">
    <nav class="hidden w-52 shrink-0 border-r p-3 md:block" aria-label="Documentation sections">
      <p class="eyebrow px-2 pb-2">On this page</p>
      <ul class="flex flex-col gap-px">
        {#each SECTIONS as s (s.id)}
          <li>
            <button
              type="button"
              class="w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150 {activeId === s.id
                ? 'bg-hover text-foreground'
                : 'text-muted-foreground hover:bg-hover hover:text-foreground'}"
              onclick={() => jump(s.id)}
            >
              {s.title}
            </button>
          </li>
        {/each}
      </ul>
    </nav>

    <div bind:this={scroller} class="min-h-0 flex-1 overflow-y-auto" onscroll={onScroll}>
      <article class="docs mx-auto flex max-w-2xl flex-col gap-10 px-6 py-8">
        <section class="flex flex-col gap-3">
          <p class="eyebrow">Card Creator</p>
          {@render heading("start", "Getting started")}
          <p>
            A deferral card is what players see while they connect to your server: a ban notice, a whitelist message,
            a queue screen. Card Creator lets you design one card per scenario and export it for your server.
          </p>
          <ol class="list-decimal space-y-1.5 pl-5">
            <li>Pick a scenario in the left sidebar. Each one loads its default layout.</li>
            <li>Drag elements on the card to move them. Click one to edit it in the Properties panel.</li>
            <li>Add elements with <strong>Add</strong> in the canvas toolbar, or start from a <strong>Template</strong>.</li>
            <li>Press <strong>Save card</strong>. The card is kept in this browser and downloaded as JSON.</li>
          </ol>
          <p>The card on the canvas keeps the style of the in-game card, so the layout you build is the one players see.</p>
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("elements", "Elements")}
          <p>Every element is positioned freely on the card. Hidden layers stay in the file but are not shown.</p>
          <dl class="divide-y rounded-[var(--radius-control)] border">
            {#each blockTypes as type (type)}
              <div class="grid grid-cols-[140px_1fr] gap-3 px-3 py-2">
                <dt class="text-foreground text-[13px] font-medium">{deferralBlockLabel(t, type)}</dt>
                <dd class="text-muted-foreground text-[13px]">{t(`panel.card_editor.blocks.${type}.description`)}</dd>
              </div>
            {/each}
          </dl>
          <p class="text-subtle-foreground text-xs">Ban reason and Ban expiry are only available on the ban scenarios.</p>
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("placeholders", "Placeholders")}
          <p>
            Write a placeholder in curly braces in any text, title or button and it is replaced when the card is shown.
            The editor fills them with sample values so you can judge the layout.
          </p>
          <div class="overflow-hidden rounded-[var(--radius-control)] border">
            <table class="w-full text-left text-[13px]">
              <thead class="bg-muted/50">
                <tr>
                  <th class="eyebrow px-3 py-2 font-medium">Placeholder</th>
                  <th class="eyebrow px-3 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                {#each PLACEHOLDERS as p (p.token)}
                  <tr>
                    <td class="px-3 py-2 whitespace-nowrap"><code class="text-accent text-xs">{p.token}</code></td>
                    <td class="text-muted-foreground px-3 py-2">{p.text}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="font-medium">Example</p>
          <CodeBlock lang="text" code={SNIPPET_PLACEHOLDERS} />
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("formatting", "Formatting")}
          <p>Text supports a small set of HTML tags. Three extra tags turn into the styles used in game:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><code>&lt;strong&gt;</code> for bold and <code>&lt;br&gt;</code> for a line break.</li>
            <li><code>&lt;code&gt;</code> for a soft blue inline code chip.</li>
            <li><code>&lt;codeid&gt;</code> for the spaced orange ID chip used by request and ban IDs.</li>
            <li><code>&lt;guildname&gt;</code> for the highlighted Discord server name.</li>
          </ul>
          <CodeBlock lang="html" code={SNIPPET_FORMATTING} />
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("buttons", "Buttons and images")}
          <p>
            A button opens a link in the player's browser. Only <code>http</code> and <code>https</code> links work, and
            placeholders are allowed, so <code>{"{discordInvite}"}</code> is a good default. Buttons are stored as JSON:
          </p>
          <CodeBlock lang="json" code={SNIPPET_BUTTON} />
          <p>
            Custom images accept SVG up to {kb(DEFERRAL_SVG_MAX_BYTES)} KB and PNG or GIF up to {kb(DEFERRAL_PNG_MAX_BYTES)} KB.
            GIFs keep their animation.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("templates", "Templates")}
          <p>
            Open <strong>Templates</strong> in the header to replace the current layout with a ready-made one. Only templates
            that fit the selected scenario are listed. Applying one is a normal edit: <strong>Undo</strong> brings your previous
            layout back, and nothing is stored until you save.
          </p>
          <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {#each CARD_TEMPLATES as tpl (tpl.id)}
              <li class="rounded-[var(--radius-control)] border px-3 py-2">
                <p class="text-[13px] font-medium">{tpl.name}</p>
                <p class="text-muted-foreground text-xs">{tpl.description}</p>
              </li>
            {/each}
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("export", "Saving and exporting")}
          <p>
            <strong>Save card</strong> keeps the scenario in this browser and downloads
            <code>deferral-&lt;scenario&gt;.json</code>. The <strong>File</strong> menu exports one scenario or all of them as
            JSON or Lua, and <strong>Import</strong> reads a JSON export back in.
          </p>
          {#if exports}
            <p class="font-medium">Export of the current scenario</p>
            <CodeBlock lang="json" code={exports.jsonShown} copyText={exports.json} />
          {/if}
        </section>

        <section class="flex flex-col gap-3">
          {@render heading("lua", "Using exports in Lua")}
          <p>
            The Lua export is a module that returns the same data as the JSON file. Drop it into a resource and load it on
            the server:
          </p>
          <CodeBlock lang="lua" code={SNIPPET_LUA} />
          <p>The JSON export can be read the same way with <code>json.decode</code>:</p>
          <CodeBlock lang="lua" code={SNIPPET_LUA_JSON} />
          {#if exports}
            <p class="font-medium">Lua export of the current scenario</p>
            <CodeBlock lang="lua" code={exports.lua.length > 1200 ? `${exports.lua.slice(0, 1200)}…` : exports.lua} copyText={exports.lua} />
          {/if}
        </section>

        <section class="flex flex-col gap-3 pb-8">
          {@render heading("shortcuts", "Shortcuts")}
          <dl class="divide-y rounded-[var(--radius-control)] border">
            {#each SHORTCUTS as s (s.text)}
              <div class="flex items-center justify-between gap-4 px-3 py-2">
                <dt class="text-muted-foreground text-[13px]">{s.text}</dt>
                <dd class="flex gap-1">
                  {#each s.keys as k (k)}
                    <kbd class="bg-muted rounded border px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd>
                  {/each}
                </dd>
              </div>
            {/each}
          </dl>
        </section>
      </article>
    </div>
  </div>
</Modal>

<style>
  .docs :global(p),
  .docs :global(li) {
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--color-muted-foreground);
    text-wrap: pretty;
  }
  .docs :global(strong) {
    color: var(--color-foreground);
    font-weight: 600;
  }
  .docs :global(p > code),
  .docs :global(li > code) {
    border: 1px solid var(--color-border);
    background: var(--color-muted);
    border-radius: 0.3rem;
    padding: 0.05rem 0.3rem;
    font-size: 0.8em;
    color: var(--color-foreground);
  }
</style>
