import type { Hex } from "../../base.ts";

/** Abstract interface for a [window.ethereum](https://eips.ethereum.org/EIPS/eip-1193) object. */
export interface AbstractWindowEthereum {
    // deno-lint-ignore no-explicit-any
    request(args: { method: any; params: any }): Promise<any>;
}

/** Signs typed data using `window.ethereum` (EIP-1193) with `eth_signTypedData_v4` (EIP-712). */
export async function signTypedDataWithWindowEthereum(args: {
    ethereum: AbstractWindowEthereum;
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
    const { ethereum, domain, types, primaryType, message } = args;

    const accounts = await ethereum.request({ method: "eth_requestAccounts", params: [] });
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("No Ethereum accounts available");
    }

    const from = accounts[0] as Hex;
    const dataToSign = JSON.stringify({
        domain,
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            ...types,
        },
        primaryType,
        message,
    });
    return await ethereum.request({ method: "eth_signTypedData_v4", params: [from, dataToSign] }) as Hex;
}

/** Checks if the given value is an abstract `window.ethereum` object. */
export function isAbstractWindowEthereum(client: unknown): client is AbstractWindowEthereum {
    return typeof client === "object" && client !== null &&
        "request" in client && typeof client.request === "function" &&
        client.request.length >= 1;
}
