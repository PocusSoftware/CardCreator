export function createDeferralBlockId(): string {
    return `blk_${Math.random().toString(36).slice(2, 10)}`;
}
