<script lang="ts">
  import {
    DEFAULT_DEFERRAL_BUTTON_CONTENT,
    normalizeDeferralButtonColorForPicker,
    parseDeferralButtonContent,
    serializeDeferralButtonContent,
    type DeferralButtonContent,
  } from "@shared/deferralCardButton";
  import { t } from "../locale/locale";
  import Input from "./primitives/Input.svelte";

  let {
    content,
    onChange,
  }: { content: string | undefined; onChange: (serialized: string) => void } = $props();

  let draft = $state<DeferralButtonContent>(parseDeferralButtonContent(""));
  let lastEmitted = $state("");

  $effect(() => {
    const incoming = content ?? "";
    if (incoming === lastEmitted) return;
    const parsed = parseDeferralButtonContent(incoming);
    draft = parsed;
    lastEmitted = serializeDeferralButtonContent(parsed, { sanitizeColors: false });
  });

  const commit = (next: DeferralButtonContent) => {
    draft = next;
    const serialized = serializeDeferralButtonContent(next, { sanitizeColors: false });
    lastEmitted = serialized;
    onChange(serialized);
  };
</script>

<div class="space-y-3">
  <div class="space-y-1.5">
    <label class="text-muted-foreground text-xs font-medium" for="deferral-btn-label">
      {t("panel.card_editor.button_editor.label")}
    </label>
    <Input
      id="deferral-btn-label"
      value={draft.label}
      placeholder={t("panel.card_editor.button_editor.label_placeholder")}
      oninput={(e) => commit({ ...draft, label: (e.target as HTMLInputElement).value })}
    />
  </div>

  <div class="space-y-1.5">
    <label class="text-muted-foreground text-xs font-medium" for="deferral-btn-url">
      {t("panel.card_editor.button_editor.url")}
    </label>
    <Input
      id="deferral-btn-url"
      value={draft.url}
      placeholder={t("panel.card_editor.button_editor.url_placeholder")}
      oninput={(e) => commit({ ...draft, url: (e.target as HTMLInputElement).value })}
    />
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div class="space-y-1.5">
      <label class="text-muted-foreground text-xs font-medium" for="deferral-btn-bg">
        {t("panel.card_editor.button_editor.background")}
      </label>
      <div class="flex items-center gap-2">
        <input
          id="deferral-btn-bg"
          type="color"
          value={normalizeDeferralButtonColorForPicker(
            draft.backgroundColor,
            DEFAULT_DEFERRAL_BUTTON_CONTENT.backgroundColor,
          )}
          oninput={(e) => commit({ ...draft, backgroundColor: (e.target as HTMLInputElement).value })}
          class="size-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <Input
          value={draft.backgroundColor}
          oninput={(e) => commit({ ...draft, backgroundColor: (e.target as HTMLInputElement).value })}
          class="font-mono text-xs"
          placeholder="#5865F2"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-muted-foreground text-xs font-medium" for="deferral-btn-text">
        {t("panel.card_editor.button_editor.text_color")}
      </label>
      <div class="flex items-center gap-2">
        <input
          id="deferral-btn-text"
          type="color"
          value={normalizeDeferralButtonColorForPicker(
            draft.textColor,
            DEFAULT_DEFERRAL_BUTTON_CONTENT.textColor,
          )}
          oninput={(e) => commit({ ...draft, textColor: (e.target as HTMLInputElement).value })}
          class="size-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <Input
          value={draft.textColor}
          oninput={(e) => commit({ ...draft, textColor: (e.target as HTMLInputElement).value })}
          class="font-mono text-xs"
          placeholder="#ffffff"
        />
      </div>
    </div>
  </div>

  <p class="text-muted-foreground text-xs">{t("panel.card_editor.button_editor.hint")}</p>
</div>
