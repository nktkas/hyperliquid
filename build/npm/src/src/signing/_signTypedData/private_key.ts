import { keccak_256 } from "@noble/hashes/sha3";
import { etc, getPublicKey, signAsync, utils } from "@noble/secp256k1";

interface Types {
    [type: string]: {
        name: string;
        type: string;
    }[];
}

interface Domain extends Record<string, unknown> {
    name?: string;
    version?: string;
    chainId?: number | string | bigint | `0x${string}`;
    verifyingContract?: `0x${string}`;
    salt?: `0x${string}`;
}

/** Signs typed data with a private key. */
export async function signTypedData(args: {
    privateKey: string;
    domain?: Domain;
    types: Types;
    primaryType: string;
    message: Record<string, unknown>;
}): Promise<`0x${string}`> {
    const {
        privateKey,
        domain = {},
        types,
        primaryType,
        message,
    } = args;

    const hash = hashTypedData({ domain, types, primaryType, message });

    const signature = await signAsync(hash, cleanHex(privateKey));

    const r = signature.r.toString(16).padStart(64, "0");
    const s = signature.s.toString(16).padStart(64, "0");
    const v = (signature.recovery + 27).toString(16).padStart(2, "0");

    return `0x${r}${s}${v}`;
}

function hashTypedData(args: {
    domain: Domain;
    types: Types;
    primaryType: string;
    message: Record<string, unknown>;
}): Uint8Array {
    const { domain, types: types_, primaryType, message } = args;

    const domainFields = [];
    if (domain.name !== undefined) {
        domainFields.push({ name: "name", type: "string" });
    }
    if (domain.version !== undefined) {
        domainFields.push({ name: "version", type: "string" });
    }
    if (domain.chainId !== undefined) {
        domainFields.push({ name: "chainId", type: "uint256" });
    }
    if (domain.verifyingContract !== undefined) {
        domainFields.push({ name: "verifyingContract", type: "address" });
    }
    if (domain.salt !== undefined) {
        domainFields.push({ name: "salt", type: "bytes32" });
    }

    const types = {
        EIP712Domain: domainFields,
        ...types_,
    };

    const bytes: Uint8Array[] = [new Uint8Array([0x19, 0x01])];
    bytes.push(hashStruct("EIP712Domain", domain, types));
    if (primaryType !== "EIP712Domain") bytes.push(hashStruct(primaryType, message, types));

    return keccak_256(etc.concatBytes(...bytes));
}

function hashStruct(primaryType: string, data: Record<string, unknown>, types: Types): Uint8Array {
    const typeHash = keccak_256(new TextEncoder().encode(encodeType(primaryType, types)));
    const encodedValues = types[primaryType].map((field) => encodeValue(field.type, data[field.name], types));
    return keccak_256(etc.concatBytes(typeHash, ...encodedValues));
}

function encodeType(primaryType: string, types: Types): string {
    const deps = findTypeDependencies(primaryType, types);
    const sortedDeps = [primaryType, ...deps.filter((d) => d !== primaryType).sort()];
    return sortedDeps
        .map((type) =>
            `${type}(${types[type].map((field) => `${resolveTypeAlias(field.type)} ${field.name}`).join(",")})`
        )
        .join("");
}

function resolveTypeAlias(type: string): string {
    if (type === "uint") return "uint256";
    if (type === "int") return "int256";
    return type;
}

function findTypeDependencies(primaryType: string, types: Types, _found = new Set<string>()): string[] {
    if (_found.has(primaryType) || !types[primaryType]) return [];
    _found.add(primaryType);

    for (const field of types[primaryType]) {
        const baseType = field.type.replace(/\[.*?\]/g, "");
        if (types[baseType]) {
            findTypeDependencies(baseType, types, _found);
        }
    }
    return Array.from(_found);
}

function encodeValue(type: string, value: unknown, types: Types): Uint8Array {
    const arrayMatch = type.match(/^(.*)\[(\d*)\]$/);
    if (arrayMatch) {
        // Extract type info: base type and optional length
        const [, baseType, len] = arrayMatch;
        if (!Array.isArray(value)) {
            throw new Error(`Expected array for ${type}. Received: ${typeof value}`);
        }
        if (len && value.length !== +len) {
            throw new Error(`Invalid length for ${type}: expected ${len}. Received: ${value.length}`);
        }

        // Encode each element in the array and hash them together
        const encodedElements = value.map((v) => encodeValue(baseType, v, types));
        return keccak_256(etc.concatBytes(...encodedElements));
    }

    if (types[type]) {
        if (value === undefined) return new Uint8Array(32);
        return hashStruct(type, value as Record<string, unknown>, types);
    }

    if (type === "string") {
        return keccak_256(new TextEncoder().encode(value as string));
    }

    if (type === "address") {
        const bytes = etc.hexToBytes(cleanHex(value as string));
        if (bytes.length !== 20) {
            throw new Error(`Address must be 20 bytes.`);
        }
        const padded = new Uint8Array(32);
        padded.set(bytes, 12);
        return padded;
    }

    if (type.startsWith("uint") || type.startsWith("int")) {
        // Extract type info: uint/int and bit size
        const isUint = type.startsWith("uint");
        const bitsStr = type.slice(isUint ? 4 : 3);
        const bits = parseInt(bitsStr || "256");
        if (bits > 256 || bits % 8 !== 0) {
            throw new Error(`Invalid ${isUint ? "uint" : "int"} size: ${bitsStr}. Must be 8-256 in steps of 8`);
        }

        // Apply Two's complement for specified bit size
        const bigIntValue = BigInt(value as number | string | bigint | `0x${string}`);
        const resizedValue = isUint ? BigInt.asUintN(bits, bigIntValue) : BigInt.asIntN(bits, bigIntValue);

        // Convert to 32-byte big-endian
        const hex = BigInt.asUintN(256, resizedValue).toString(16).padStart(64, "0");
        return etc.hexToBytes(hex);
    }

    if (type === "bool") {
        const result = new Uint8Array(32);
        result[31] = value ? 1 : 0;
        return result;
    }

    if (type === "bytes") {
        const bytes = typeof value === "string" ? etc.hexToBytes(cleanHex(value)) : value as Uint8Array;
        return keccak_256(bytes);
    }

    const bytesMatch = type.match(/^bytes(\d+)$/);
    if (bytesMatch) {
        // Extract type info: bytes size
        const size = parseInt(bytesMatch[1]);
        if (size === 0 || size > 32) {
            throw new Error(`bytesN size must be 1-32. Received: ${size}`);
        }

        // Convert hex to bytes
        const bytes = etc.hexToBytes(cleanHex(value as string));
        if (bytes.length !== size) {
            throw new Error(`${type} requires exactly ${size} bytes. Received: ${bytes.length} from '${value}'`);
        }

        // Pad to 32 bytes
        const padded = new Uint8Array(32);
        padded.set(bytes, 0);
        return padded;
    }

    throw new Error(`Unsupported type: '${type}'.`);
}

function cleanHex(hex: string): string {
    return hex.startsWith("0x") ? hex.slice(2) : hex;
}

/** Validates if a string is a valid secp256k1 private key. */
export function isValidPrivateKey(privateKey: unknown): privateKey is string {
    if (typeof privateKey !== "string") return false;
    return utils.isValidPrivateKey(cleanHex(privateKey));
}

/** Converts a private key to an Ethereum address. */
export function privateKeyToAddress(privateKey: string): `0x${string}` {
    const cleanPrivKey = cleanHex(privateKey);

    const publicKey = getPublicKey(cleanPrivKey, false);
    const publicKeyWithoutPrefix = publicKey.slice(1);

    const hash = keccak_256(publicKeyWithoutPrefix);

    const addressBytes = hash.slice(-20);
    const address = etc.bytesToHex(addressBytes);

    return `0x${address}`;
}
