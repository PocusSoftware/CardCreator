import type { DeferralCardSizePresetId } from "@shared/deferralCardCanvas";
import type { DeferralBlockType } from "@shared/deferralCardLayout";
import type { LocaleT } from "./locale";

export type { LocaleT };

export function deferralBlockLabel(t: LocaleT, type: DeferralBlockType): string {
    return t(`panel.card_editor.blocks.${type}.label`);
}

export function deferralScenarioLabel(t: LocaleT, id: string, fallback?: string): string {
    return t(`panel.card_editor.scenarios.${id}.label`, undefined, fallback ?? id);
}

export function deferralSizePresetLabel(t: LocaleT, id: DeferralCardSizePresetId): string {
    return t(`panel.card_editor.size_presets.${id}`);
}
