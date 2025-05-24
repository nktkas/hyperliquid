export type Hex = `0x${string}`;

export type MaybePromise<T> = T | Promise<T>;

/** Base class for all Hyperliquid SDK errors. */
export class HyperliquidError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "HyperliquidError";
    }
}
