import { assertEquals } from "jsr:@std/assert@1";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@2/accounts";
import { createWalletClient, http } from "npm:viem@2";
import { mainnet } from "npm:viem@2/chains";
import { ethers } from "npm:ethers@6";
import { ExchangeClient, HttpTransport } from "../../../mod.ts";

Deno.test("_guessSignatureChainId", async (t) => {
    await t.step("viem", async () => {
        const wallet = createWalletClient({
            account: privateKeyToAccount(generatePrivateKey()),
            transport: http("https://ethereum-rpc.publicnode.com"),
            chain: mainnet,
        });
        const transport = new HttpTransport();
        const exchClient = new ExchangeClient({ wallet, transport });

        const signatureChainId = typeof exchClient.signatureChainId === "string"
            ? exchClient.signatureChainId
            : await exchClient.signatureChainId();
        assertEquals(signatureChainId, "0x1");
    });

    await t.step("ethers.js", async () => {
        const provider = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com");
        const wallet = new ethers.Wallet(generatePrivateKey(), provider);

        const transport = new HttpTransport();
        const exchClient = new ExchangeClient({ wallet, transport });

        const signatureChainId = typeof exchClient.signatureChainId === "string"
            ? exchClient.signatureChainId
            : await exchClient.signatureChainId();
        assertEquals(signatureChainId, "0x1");
    });

    await t.step("window.ethereum", async () => {
        const ethereum = { // Mock window.ethereum
            // deno-lint-ignore require-await
            request: async ({ method }: { method: string }) => {
                if (method === "eth_chainId") {
                    return ["0x1"];
                }
            },
        };

        const transport = new HttpTransport();
        const exchClient = new ExchangeClient({ wallet: ethereum, transport });

        const signatureChainId = typeof exchClient.signatureChainId === "string"
            ? exchClient.signatureChainId
            : await exchClient.signatureChainId();
        assertEquals(signatureChainId, "0x1");
    });

    await t.step("default", async (t) => {
        const account = privateKeyToAccount(generatePrivateKey());

        await t.step("mainnet", async () => {
            const transport = new HttpTransport();
            const exchClient = new ExchangeClient({ wallet: account, transport });

            const signatureChainId = typeof exchClient.signatureChainId === "string"
                ? exchClient.signatureChainId
                : await exchClient.signatureChainId();
            assertEquals(signatureChainId, "0xa4b1");
        });

        await t.step("testnet", async () => {
            const transport = new HttpTransport();
            const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

            const signatureChainId = typeof exchClient.signatureChainId === "string"
                ? exchClient.signatureChainId
                : await exchClient.signatureChainId();
            assertEquals(signatureChainId, "0x66eee");
        });
    });
});
