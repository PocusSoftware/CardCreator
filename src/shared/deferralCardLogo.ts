export const DEFERRAL_CARD_WATERMARK_PATH = '/deferral-card-logo.png';

export const DEFERRAL_CARD_LOGO_PATH = '/logo.svg';

export function extractPngBufferFromLogoSvg(svgText: string): Buffer | null {
    if (!svgText?.trim()) return null;
    const match = svgText.match(/data:(?:image|img)\/png;base64,([A-Za-z0-9+/=]+)/i);
    if (!match?.[1]) return null;
    try {
        return Buffer.from(match[1], 'base64');
    } catch {
        return null;
    }
}
