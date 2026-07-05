import type { DeferralCardsConfig, DeferralCardTemplate, DeferralScenarioId } from './deferralCardTypes';
import {
    dataUriToSvgText,
    isDeferralGifDataUri,
    isDeferralPngDataUri,
    isDeferralSvgDataUri,
    svgTextToPngDataUriBrowser,
} from './deferralCardSvg';
import type { DeferralCanvasElement } from './deferralCardCanvas';
import { getTemplateCanvas, templateWithCanvas } from './deferralCardCanvas';

export const DEFERRAL_IMAGE_MAX_PX = 384;

export async function rasterizeCanvasElements(elements: DeferralCanvasElement[]): Promise<DeferralCanvasElement[]> {
    if (typeof document === 'undefined') return elements;

    return Promise.all(
        elements.map(async (el) => {
            if (el.type !== 'custom_image' || !el.content?.trim()) return el;
            if (isDeferralPngDataUri(el.content) || isDeferralGifDataUri(el.content)) return el;
            if (!isDeferralSvgDataUri(el.content)) return el;

            const svg = dataUriToSvgText(el.content);
            if (!svg) return el;

            const png = await svgTextToPngDataUriBrowser(svg, DEFERRAL_IMAGE_MAX_PX);
            return png ? { ...el, content: png } : el;
        }),
    );
}

export async function ensureDeferralCardsImageRasterization(config: DeferralCardsConfig): Promise<DeferralCardsConfig> {
    if (typeof document === 'undefined') return config;

    const scenarios = { ...config.scenarios };
    for (const scenarioId of Object.keys(scenarios) as DeferralScenarioId[]) {
        const tpl = scenarios[scenarioId];
        if (!tpl) continue;
        const rasterized = await rasterizeTemplateImages(tpl);
        if (rasterized) scenarios[scenarioId] = rasterized;
    }
    return { ...config, scenarios };
}

async function rasterizeTemplateImages(template: DeferralCardTemplate): Promise<DeferralCardTemplate | null> {
    const canvas = getTemplateCanvas(template);
    if (!canvas.elements.some((el) => el.type === 'custom_image' && el.content?.trim())) {
        return null;
    }

    let changed = false;
    const elements = await Promise.all(
        canvas.elements.map(async (el) => {
            if (el.type !== 'custom_image' || !el.content?.trim()) return el;
            if (isDeferralPngDataUri(el.content) || isDeferralGifDataUri(el.content)) return el;
            if (!isDeferralSvgDataUri(el.content)) return el;

            const svg = dataUriToSvgText(el.content);
            if (!svg) return el;

            const png = await svgTextToPngDataUriBrowser(svg, DEFERRAL_IMAGE_MAX_PX);
            if (!png) return el;

            changed = true;
            return { ...el, content: png };
        }),
    );

    if (!changed) return null;
    return templateWithCanvas(template, { ...canvas, elements });
}
