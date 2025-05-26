export type Hex = `0x${string}`;

export type MaybePromise<T> = T | Promise<T>;

/** Base error class for all SDK errors. */
export class HyperliquidError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "HyperliquidError";
    }
}
