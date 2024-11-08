/** Hexadecimal string starting with `0x`. */
export type Hex = `0x${string}`;

/** Converts a byte array to a hex string. */
export function hexToBytes(hex: Hex): Uint8Array {
    const len = hex.length;
    if (len % 2 !== 0) throw new Error(`Invalid hex string length: ${len}. Length must be even.`);
    const bytes = new Uint8Array(len / 2);
    for (let i = 0; i < len; i += 2) {
        const c1 = hex.charCodeAt(i);
        const c2 = hex.charCodeAt(i + 1);

        let high: number;
        if (c1 >= 48 && c1 <= 57) { // '0' - '9'
            high = c1 - 48;
        } else if (c1 >= 65 && c1 <= 70) { // 'A' - 'F'
            high = c1 - 55;
        } else if (c1 >= 97 && c1 <= 102) { // 'a' - 'f'
            high = c1 - 87;
        } else {
            throw new Error(`Invalid hex character at index ${i}: '${hex[i]}'`);
        }

        let low: number;
        if (c2 >= 48 && c2 <= 57) { // '0' - '9'
            low = c2 - 48;
        } else if (c2 >= 65 && c2 <= 70) { // 'A' - 'F'
            low = c2 - 55;
        } else if (c2 >= 97 && c2 <= 102) { // 'a' - 'f'
            low = c2 - 87;
        } else {
            throw new Error(`Invalid hex character at index ${i + 1}: '${hex[i + 1]}'`);
        }

        bytes[i / 2] = (high << 4) | low;
    }
    return bytes;
}

/** Converts a hex string to a number. */
export function hexToNumber(hex: Hex): number {
    return parseInt(hex, 16);
}

/** Parses a signature string into its components. */
export function parseSignature(signature: Hex): { r: Hex; s: Hex; v: number } {
    if (signature.length !== 132) {
        throw new Error("Invalid signature length. Expected 132 characters.");
    }

    const r = "0x" + signature.slice(2, 66) as Hex;
    const s = "0x" + signature.slice(66, 130) as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    return { r, s, v };
}

const BYTE_TO_HEX: string[] = Array.from(
    { length: 256 },
    (_, i) => i.toString(16).padStart(2, "0"),
);

/** Converts a byte array to a hex string. */
export function bytesToHex(bytes: Uint8Array): Hex {
    let hex: Hex = "0x";
    for (let i = 0; i < bytes.length; i++) {
        hex += BYTE_TO_HEX[bytes[i]];
    }
    return hex;
}

/** Checks if a value is a hex string. */
export function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}
