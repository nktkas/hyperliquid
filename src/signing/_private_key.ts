import { keccak_256 } from "@noble/hashes/sha3";
import { CURVE, signAsync as secp256k1 } from "@noble/secp256k1";
import { decodeHex } from "@std/encoding/hex";
import { concat as concatBytes } from "@std/bytes/concat";
import type { Hex } from "../base.ts";

/** Signs typed data (EIP-712) with a private key. */
export async function signTypedDataWithPrivateKey(args: {
    privateKey: string;
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: Hex;
    };
    types: {
        [key: string]: {
            name: string;
            type: string;
        }[];
    };
    primaryType: string;
    message: Record<string, unknown>;
}): Promise<Hex> {
    const { privateKey, domain, types, primaryType, message } = args;

    // 1. Create a complete set of types, including EIP712Domain
    const fullTypes = {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ],
        ...types,
    };

    // 2. Calculate `domainSeparator`
    const domainSeparator = hashStruct("EIP712Domain", domain, fullTypes);

    // 3. Calculate the message hash
    const messageHash = hashStruct(primaryType, message, fullTypes);

    // 4. Forming the final hash
    const finalHash = keccak_256(concatBytes([new Uint8Array([0x19, 0x01]), domainSeparator, messageHash]));

    // 5. Sign the final hash
    const cleanPrivateKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    const signature = await secp256k1(finalHash, cleanPrivateKey);

    // 6. Format the signature
    const r = signature.r.toString(16).padStart(64, "0");
    const s = signature.s.toString(16).padStart(64, "0");
    const v = (signature.recovery + 27).toString(16).padStart(2, "0");

    return `0x${r}${s}${v}`;
}

/** Finds all dependent structure types for a given type. */
function findTypeDependencies(
    primaryType: string,
    types: Record<string, { name: string; type: string }[]>,
    found = new Set<string>(),
): string[] {
    if (found.has(primaryType) || !types[primaryType]) {
        return [];
    }
    found.add(primaryType);

    for (const field of types[primaryType]) {
        const baseType = field.type.replace(/\[\]$/, "");
        if (types[baseType]) {
            findTypeDependencies(baseType, types, found);
        }
    }
    return Array.from(found);
}

/** Encodes the type definition into a string according to EIP-712. */
function encodeType(
    primaryType: string,
    types: Record<string, { name: string; type: string }[]>,
): string {
    const deps = findTypeDependencies(primaryType, types);
    const sortedDeps = [primaryType, ...deps.filter((d) => d !== primaryType).sort()];

    return sortedDeps
        .map((type) => `${type}(${types[type].map((field) => `${field.type} ${field.name}`).join(",")})`)
        .join("");
}

/** Encodes a single value into a 32-byte Uint8Array according to EIP-712 rules. */
function encodeValue(
    type: string,
    value: unknown,
    allTypes: Record<string, { name: string; type: string }[]>,
): Uint8Array {
    if (type.endsWith("[]")) {
        if (!Array.isArray(value)) {
            throw new Error(`Expected array for type ${type}, but got ${typeof value}`);
        }
        const baseType = type.slice(0, -2);
        const encodedElements = value.map((item) => encodeValue(baseType, item, allTypes));
        return keccak_256(concatBytes(encodedElements));
    }

    if (allTypes[type]) {
        return hashStruct(type, value as Record<string, unknown>, allTypes);
    }

    if (type === "string") {
        return keccak_256(new TextEncoder().encode(value as string));
    }
    if (type === "bytes") {
        return keccak_256(value as Uint8Array);
    }
    if (type === "bytes32") {
        return decodeHex((value as string).slice(2).padStart(64, "0"));
    }
    if (type === "address") {
        const padded = new Uint8Array(32);
        padded.set(decodeHex((value as string).slice(2)), 12);
        return padded;
    }
    if (type.startsWith("uint") || type.startsWith("int")) {
        const bigIntValue = BigInt(value as number | string | bigint);
        const bits = parseInt(type.slice(type.startsWith("u") ? 4 : 3) || "256", 10);

        const signedValue = type.startsWith("int")
            ? BigInt.asIntN(bits, bigIntValue)
            : BigInt.asUintN(bits, bigIntValue);

        let hex = signedValue.toString(16);
        if (hex.length % 2) hex = "0" + hex;
        if (signedValue < 0) {
            while (hex.length < 64) hex = "f" + hex;
            hex = hex.slice(-64);
        }
        const bytes = decodeHex(hex);
        const result = new Uint8Array(32).fill(0);
        result.set(bytes, 32 - bytes.length);
        return result;
    }
    if (type === "bool") {
        const result = new Uint8Array(32);
        result[31] = value ? 1 : 0;
        return result;
    }

    throw new Error(`Unsupported type: ${type}`);
}

/** Hashes a data structure according to EIP-712. */
function hashStruct(
    primaryType: string,
    data: Record<string, unknown>,
    types: Record<string, { name: string; type: string }[]>,
): Uint8Array {
    const typeHash = keccak_256(new TextEncoder().encode(encodeType(primaryType, types)));

    const fields = types[primaryType];
    const encodedValues = fields.map((field) => encodeValue(field.type, data[field.name], types));

    return keccak_256(concatBytes([typeHash, ...encodedValues]));
}

/** Validates if a string is a valid secp256k1 private key. */
export function isValidPrivateKey(privateKey: unknown): privateKey is string {
    if (typeof privateKey !== "string") return false;

    const cleanKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    if (cleanKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(cleanKey)) return false;

    const keyBigInt = BigInt("0x" + cleanKey);
    return keyBigInt > 0n && keyBigInt < CURVE.n;
}
