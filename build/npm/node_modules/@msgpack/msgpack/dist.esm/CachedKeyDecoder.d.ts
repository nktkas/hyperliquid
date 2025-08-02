export interface KeyDecoder {
    canBeCached(byteLength: number): boolean;
    decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string;
}
export declare class CachedKeyDecoder implements KeyDecoder {
    hit: number;
    miss: number;
    private readonly caches;
    readonly maxKeyLength: number;
    readonly maxLengthPerKey: number;
    constructor(maxKeyLength?: number, maxLengthPerKey?: number);
    canBeCached(byteLength: number): boolean;
    private find;
    private store;
    decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string;
}
