/** Hexadecimal string starting with `0x`. */
export type Hex = `0x${string}`;

/**
 * Converts a hex string to a byte array.
 * @param hex - The hex string (with or without '0x' prefix).
 * @returns The byte array.
 * @throws {Error} If the hex string is invalid.
 */
export function hexToBytes(hex: string): Uint8Array {
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

    if (cleanHex.length % 2 !== 0) {
        throw new Error(`Invalid hex string length: ${cleanHex.length}. Length must be even.`);
    }

    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        const c1 = cleanHex.charCodeAt(i);
        const c2 = cleanHex.charCodeAt(i + 1);

        let high: number;
        if (c1 >= 48 && c1 <= 57) { // '0' - '9'
            high = c1 - 48;
        } else if (c1 >= 65 && c1 <= 70) { // 'A' - 'F'
            high = c1 - 55;
        } else if (c1 >= 97 && c1 <= 102) { // 'a' - 'f'
            high = c1 - 87;
        } else {
            throw new Error(`Invalid hex character at index ${i}: '${cleanHex[i]}'`);
        }

        let low: number;
        if (c2 >= 48 && c2 <= 57) { // '0' - '9'
            low = c2 - 48;
        } else if (c2 >= 65 && c2 <= 70) { // 'A' - 'F'
            low = c2 - 55;
        } else if (c2 >= 97 && c2 <= 102) { // 'a' - 'f'
            low = c2 - 87;
        } else {
            throw new Error(`Invalid hex character at index ${i + 1}: '${cleanHex[i + 1]}'`);
        }

        bytes[i / 2] = (high << 4) | low;
    }
    return bytes;
}

const BYTE_TO_HEX: string[] = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

/**
 * Converts a byte array to a hex string.
 * @param bytes - The byte array.
 * @returns The hex string.
 */
export function bytesToHex(bytes: Uint8Array): Hex {
    let hex: Hex = "0x";
    for (let i = 0; i < bytes.length; i++) {
        hex += BYTE_TO_HEX[bytes[i]];
    }
    return hex;
}

/**
 * Parses a signature string into its components.
 * @param signature - The signature string (with or without '0x' prefix).
 * @returns The signature components.
 * @throws {Error} If the signature string is invalid.
 */
export function parseSignature(signature: string): { r: Hex; s: Hex; v: number } {
    const cleanSignature = signature.startsWith("0x") ? signature.slice(2) : signature;

    if (cleanSignature.length !== 130) {
        throw new Error("Invalid signature length. Expected 130 characters.");
    }

    const r = "0x" + cleanSignature.slice(0, 64) as Hex;
    const s = "0x" + cleanSignature.slice(64, 128) as Hex;
    const v = parseInt(cleanSignature.slice(128, 130), 16);

    return { r, s, v };
}
