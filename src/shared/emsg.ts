/**
 * Extracts the message from an unknown error value.
 * Useful in catch blocks where the error type is unknown.
 */
export const emsg = (e: unknown): string => {
    return e instanceof Error ? e.message : String(e);
};
