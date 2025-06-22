export type Hex = `0x${string}`;

export type MaybePromise<T> = T | Promise<T>;

// https://github.com/microsoft/TypeScript/issues/13923#issuecomment-2191862501
export type DeepImmutable<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};

/** Base error class for all SDK errors. */
export class HyperliquidError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "HyperliquidError";
    }
}
