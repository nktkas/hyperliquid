import { assert, assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.54/accounts";
import { ethers } from "npm:ethers@^6.13.4";
import { ethers as ethersV5 } from "npm:ethers@^5.7.2";
import { createL1ActionHash, signL1Action, signUserSignedAction } from "../../src/signing.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = "0x822e9959e022b78423eb653a62ea0020cd283e71a2a8133a6ff2aeffaf373cff" as const;
const L1_ACTION_SIGNATURE = {
    data: {
        action: {
            type: "order",
            orders: [{
                a: 0,
                b: true,
                p: "30000",
                s: "0.1",
                r: false,
                t: {
                    limit: {
                        tif: "Gtc",
                    },
                },
            }],
            grouping: "na",
            _bigIntTest: 1000000000000000,
        },
        nonce: 1234567890,
        vaultAddress: "0x1234567890123456789012345678901234567890",
    },
    signature: {
        mainnet: {
            withVaultAddress: {
                r: "0x08b577503dbbb5121356622329289b7638f3b5725e88d20670f9a245ebd2d80a",
                s: "0x567e319904c37a7a92d47be922719df4b989b57a26ac19fb5cc478c727209ab8",
                v: 28,
            },
            withoutVaultAddress: {
                r: "0x55b0aa007bd84ff7547289a30bf0ad3c4e3537f08b12fccf2dce5e30810f703f",
                s: "0x512e030a3c34616a64e329a4039ce756f91880da788cb4186a1d406882550336",
                v: 28,
            },
        },
        testnet: {
            withVaultAddress: {
                r: "0x5aa89b20d28340929e83b0eee77d7ed83655d22047f05f5830677f19c3cbbca7",
                s: "0x0f38f9f606fd71375274b081215a8a98ce2bb5d39424ec3c174094c73d98f78a",
                v: 27,
            },
            withoutVaultAddress: {
                r: "0xe596570918086ef505643a42f5280e3a4e091127b0c29a83dd22033c812aff40",
                s: "0x06145d2918974f1e9779f7cd8511fe00690f0f1becd6855079c1ff2b51e0b419",
                v: 27,
            },
        },
    },
    actionHash: {
        withVaultAddress: "0xbfeb02dfba487de4da4bf5b9a9bc2e5d0f0aa205b74ad5a4b459c95fbe583a06",
        withoutVaultAddress: "0x21a8fc6e6ca5a771bef30fe5b423193f4acb7e32ae013fb4c35a50d66b6f6cbe",
    },
} as const;
const USER_SIGNED_ACTION_SIGNATURE = {
    data: {
        action: {
            hyperliquidChain: "Mainnet",
            signatureChainId: "0x66eee",
            destination: "0x1234567890123456789012345678901234567890",
            amount: "1000",
            time: 1234567890,
        },
        payloadTypes: [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
        primaryType: "HyperliquidTransaction:UsdSend",
        chainId: parseInt("0x66eee", 16),
    },
    signature: {
        r: "0xf777c38efe7c24cc71209526ae608f4e384d0586edf578f0e97b4b9f7c7adcc6",
        s: "0x104a4a97c48ae77bf5bd777bdd45fe72d8f5ff29116b5ff64fd8cfe4ea610786",
        v: 28,
    },
} as const;

// —————————— Test ——————————

Deno.test("Signature Generation Tests", async (t) => {
    const viemWallet = privateKeyToAccount(PRIVATE_KEY);
    const extendedViemWallet = {
        signTypedData: (
            params: {
                domain: {
                    name: string;
                    version: string;
                    chainId: number;
                    verifyingContract: `0x${string}`;
                };
                types: {
                    [key: string]: {
                        name: string;
                        type: string;
                    }[];
                };
                primaryType: string;
                message: Record<string, unknown>;
            },
            _options?: unknown,
        ): Promise<`0x${string}`> => {
            return viemWallet.signTypedData(params);
        },
    };
    const ethersWallet = new ethers.Wallet(PRIVATE_KEY);
    const ethersV5Wallet = new ethersV5.Wallet(PRIVATE_KEY);
    const windowEthereum = { // Mock window.ethereum
        // deno-lint-ignore require-await
        request: async ({ method, params }: { method: string; params: unknown[] }) => {
            if (method === "eth_requestAccounts") {
                return ["0xE5cA49Fb3bD9A581F0D1EF9CB5D7177Da08bf901"];
            }
            if (method === "eth_signTypedData_v4") {
                if (params[0] !== "0xE5cA49Fb3bD9A581F0D1EF9CB5D7177Da08bf901") {
                    throw new Error("Invalid account");
                }

                const typedData = JSON.parse(params[1] as string);
                const domainName = typedData.domain.name;

                if (domainName === "Exchange") {
                    const source = typedData.message.source;
                    const connectionId = typedData.message.connectionId;

                    if (source === "a") {
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withVaultAddress) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddress) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v.toString(16);
                        }
                        throw new Error("Invalid connectionId");
                    }
                    if (source === "b") {
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withVaultAddress) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddress) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v.toString(16);
                        }
                        throw new Error("Invalid connectionId");
                    }
                    throw new Error("Invalid source");
                }
                if (domainName === "HyperliquidSignTransaction") {
                    return "0x" +
                        USER_SIGNED_ACTION_SIGNATURE.signature.r.slice(2) +
                        USER_SIGNED_ACTION_SIGNATURE.signature.s.slice(2) +
                        USER_SIGNED_ACTION_SIGNATURE.signature.v.toString(16);
                }
                throw new Error("Invalid domain");
            }
        },
    };

    await t.step("L1 Action Signatures", async (t) => {
        await t.step("Action Hash", async (t) => {
            await t.step("should generate matching action hashes", async (t) => {
                await t.step("with VaultAddress", () => {
                    const actionHash = createL1ActionHash(
                        L1_ACTION_SIGNATURE.data.action,
                        L1_ACTION_SIGNATURE.data.nonce,
                        L1_ACTION_SIGNATURE.data.vaultAddress,
                    );
                    assert(
                        actionHash === L1_ACTION_SIGNATURE.actionHash.withVaultAddress,
                        `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withVaultAddress}, got: ${actionHash}`,
                    );
                });
                await t.step("without VaultAddress", () => {
                    const actionHash = createL1ActionHash(
                        L1_ACTION_SIGNATURE.data.action,
                        L1_ACTION_SIGNATURE.data.nonce,
                    );
                    assert(
                        actionHash === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddress,
                        `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withoutVaultAddress}, got: ${actionHash}`,
                    );
                });
            });
        });

        await t.step("Signatures", async (t) => {
            await t.step("should generate matching signatures", async (t) => {
                await t.step("in mainnet", async (t) => {
                    await t.step("with VaultAddress", async (t) => {
                        await t.step("Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: viemWallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Extended Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: extendedViemWallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Ethers", async () => {
                            const ethersSignature = await signL1Action({
                                wallet: ethersWallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                ethersSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                                `Ethers Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${ethersSignature.r}`,
                            );
                            assert(
                                ethersSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                                `Ethers Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${ethersSignature.s}`,
                            );
                            assert(
                                ethersSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                                `Ethers Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${ethersSignature.v}`,
                            );
                        });
                        await t.step("Ethers v5", async () => {
                            const ethersV5Signature = await signL1Action({
                                wallet: ethersV5Wallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                ethersV5Signature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                                `Ethers v5 Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${ethersV5Signature.r}`,
                            );
                            assert(
                                ethersV5Signature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                                `Ethers v5 Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${ethersV5Signature.s}`,
                            );
                            assert(
                                ethersV5Signature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                                `Ethers v5 Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${ethersV5Signature.v}`,
                            );
                        });
                        await t.step("window.ethereum", async () => {
                            const windowEthereumSignature = await signL1Action({
                                wallet: windowEthereum,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                windowEthereumSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                                `Window Ethereum Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${windowEthereumSignature.r}`,
                            );
                            assert(
                                windowEthereumSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                                `Window Ethereum Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${windowEthereumSignature.s}`,
                            );
                            assert(
                                windowEthereumSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                                `Window Ethereum Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${windowEthereumSignature.v}`,
                            );
                        });
                    });
                    await t.step("without VaultAddress", async (t) => {
                        await t.step("Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: viemWallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Extended Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: extendedViemWallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Ethers", async () => {
                            const ethersSignature = await signL1Action({
                                wallet: ethersWallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                ethersSignature.r === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r,
                                `Ethers Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r}, got: ${ethersSignature.r}`,
                            );
                            assert(
                                ethersSignature.s === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s,
                                `Ethers Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s}, got: ${ethersSignature.s}`,
                            );
                            assert(
                                ethersSignature.v === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v,
                                `Ethers Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v}, got: ${ethersSignature.v}`,
                            );
                        });
                        await t.step("Ethers v5", async () => {
                            const ethersV5Signature = await signL1Action({
                                wallet: ethersV5Wallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                ethersV5Signature.r === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r,
                                `Ethers v5 Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r}, got: ${ethersV5Signature.r}`,
                            );
                            assert(
                                ethersV5Signature.s === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s,
                                `Ethers v5 Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s}, got: ${ethersV5Signature.s}`,
                            );
                            assert(
                                ethersV5Signature.v === L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v,
                                `Ethers v5 Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v}, got: ${ethersV5Signature.v}`,
                            );
                        });
                        await t.step("window.ethereum", async () => {
                            const windowEthereumSignature = await signL1Action({
                                wallet: windowEthereum,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                windowEthereumSignature.r ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r,
                                `Window Ethereum Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.r}, got: ${windowEthereumSignature.r}`,
                            );
                            assert(
                                windowEthereumSignature.s ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s,
                                `Window Ethereum Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.s}, got: ${windowEthereumSignature.s}`,
                            );
                            assert(
                                windowEthereumSignature.v ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v,
                                `Window Ethereum Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddress.v}, got: ${windowEthereumSignature.v}`,
                            );
                        });
                    });
                });

                await t.step("in testnet", async (t) => {
                    await t.step("with VaultAddress", async (t) => {
                        await t.step("Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: viemWallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Extended Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: extendedViemWallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Ethers", async () => {
                            const ethersSignature = await signL1Action({
                                wallet: ethersWallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                ethersSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                                `Ethers Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${ethersSignature.r}`,
                            );
                            assert(
                                ethersSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                                `Ethers Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${ethersSignature.s}`,
                            );
                            assert(
                                ethersSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                                `Ethers Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${ethersSignature.v}`,
                            );
                        });
                        await t.step("Ethers v5", async () => {
                            const ethersV5Signature = await signL1Action({
                                wallet: ethersV5Wallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                ethersV5Signature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                                `Ethers v5 Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${ethersV5Signature.r}`,
                            );
                            assert(
                                ethersV5Signature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                                `Ethers v5 Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${ethersV5Signature.s}`,
                            );
                            assert(
                                ethersV5Signature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                                `Ethers v5 Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${ethersV5Signature.v}`,
                            );
                        });
                        await t.step("window.ethereum", async () => {
                            const windowEthereumSignature = await signL1Action({
                                wallet: windowEthereum,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                windowEthereumSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                                `Window Ethereum Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${windowEthereumSignature.r}`,
                            );
                            assert(
                                windowEthereumSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                                `Window Ethereum Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${windowEthereumSignature.s}`,
                            );
                            assert(
                                windowEthereumSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                                `Window Ethereum Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${windowEthereumSignature.v}`,
                            );
                        });
                    });
                    await t.step("without VaultAddress", async (t) => {
                        await t.step("Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: viemWallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Extended Viem", async () => {
                            const viemSignature = await signL1Action({
                                wallet: extendedViemWallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                viemSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r,
                                `Viem Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r}, got: ${viemSignature.r}`,
                            );
                            assert(
                                viemSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s,
                                `Viem Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s}, got: ${viemSignature.s}`,
                            );
                            assert(
                                viemSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v,
                                `Viem Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v}, got: ${viemSignature.v}`,
                            );
                        });
                        await t.step("Ethers", async () => {
                            const ethersSignature = await signL1Action({
                                wallet: ethersWallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                ethersSignature.r === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r,
                                `Ethers Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r}, got: ${ethersSignature.r}`,
                            );
                            assert(
                                ethersSignature.s === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s,
                                `Ethers Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s}, got: ${ethersSignature.s}`,
                            );
                            assert(
                                ethersSignature.v === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v,
                                `Ethers Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v}, got: ${ethersSignature.v}`,
                            );
                        });
                        await t.step("Ethers v5", async () => {
                            const ethersV5Signature = await signL1Action({
                                wallet: ethersV5Wallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                ethersV5Signature.r === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r,
                                `Ethers v5 Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r}, got: ${ethersV5Signature.r}`,
                            );
                            assert(
                                ethersV5Signature.s === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s,
                                `Ethers v5 Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s}, got: ${ethersV5Signature.s}`,
                            );
                            assert(
                                ethersV5Signature.v === L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v,
                                `Ethers v5 Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v}, got: ${ethersV5Signature.v}`,
                            );
                        });
                        await t.step("window.ethereum", async () => {
                            const windowEthereumSignature = await signL1Action({
                                wallet: windowEthereum,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                windowEthereumSignature.r ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r,
                                `Window Ethereum Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.r}, got: ${windowEthereumSignature.r}`,
                            );
                            assert(
                                windowEthereumSignature.s ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s,
                                `Window Ethereum Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.s}, got: ${windowEthereumSignature.s}`,
                            );
                            assert(
                                windowEthereumSignature.v ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v,
                                `Window Ethereum Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddress.v}, got: ${windowEthereumSignature.v}`,
                            );
                        });
                    });
                });
            });
        });
    });

    await t.step("User-Signed Action Signatures", async (t) => {
        await t.step("should generate matching signatures", async (t) => {
            await t.step("Viem", async () => {
                const viemSignature = await signUserSignedAction({
                    wallet: viemWallet,
                    action: USER_SIGNED_ACTION_SIGNATURE.data.action,
                    types: {
                        [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
                            ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
                        ],
                    },
                    chainId: USER_SIGNED_ACTION_SIGNATURE.data.chainId,
                });
                assert(
                    viemSignature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
                    `Viem Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${viemSignature.r}`,
                );
                assert(
                    viemSignature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
                    `Viem Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${viemSignature.s}`,
                );
                assert(
                    viemSignature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
                    `Viem Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${viemSignature.v}`,
                );
            });
            await t.step("Extended Viem", async () => {
                const viemSignature = await signUserSignedAction({
                    wallet: extendedViemWallet,
                    action: USER_SIGNED_ACTION_SIGNATURE.data.action,
                    types: {
                        [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
                            ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
                        ],
                    },
                    chainId: USER_SIGNED_ACTION_SIGNATURE.data.chainId,
                });
                assert(
                    viemSignature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
                    `Viem Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${viemSignature.r}`,
                );
                assert(
                    viemSignature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
                    `Viem Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${viemSignature.s}`,
                );
                assert(
                    viemSignature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
                    `Viem Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${viemSignature.v}`,
                );
            });
            await t.step("Ethers", async () => {
                const ethersSignature = await signUserSignedAction({
                    wallet: ethersWallet,
                    action: USER_SIGNED_ACTION_SIGNATURE.data.action,
                    types: {
                        [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
                            ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
                        ],
                    },
                    chainId: USER_SIGNED_ACTION_SIGNATURE.data.chainId,
                });
                assert(
                    ethersSignature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
                    `Ethers Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${ethersSignature.r}`,
                );
                assert(
                    ethersSignature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
                    `Ethers Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${ethersSignature.s}`,
                );
                assert(
                    ethersSignature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
                    `Ethers Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${ethersSignature.v}`,
                );
            });
            await t.step("Ethers v5", async () => {
                const ethersV5Signature = await signUserSignedAction({
                    wallet: ethersV5Wallet,
                    action: USER_SIGNED_ACTION_SIGNATURE.data.action,
                    types: {
                        [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
                            ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
                        ],
                    },
                    chainId: USER_SIGNED_ACTION_SIGNATURE.data.chainId,
                });
                assert(
                    ethersV5Signature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
                    `Ethers v5 Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${ethersV5Signature.r}`,
                );
                assert(
                    ethersV5Signature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
                    `Ethers v5 Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${ethersV5Signature.s}`,
                );
                assert(
                    ethersV5Signature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
                    `Ethers v5 Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${ethersV5Signature.v}`,
                );
            });
            await t.step("window.ethereum", async () => {
                const windowEthereumSignature = await signUserSignedAction({
                    wallet: windowEthereum,
                    action: USER_SIGNED_ACTION_SIGNATURE.data.action,
                    types: {
                        [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
                            ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
                        ],
                    },
                    chainId: USER_SIGNED_ACTION_SIGNATURE.data.chainId,
                });
                assert(
                    windowEthereumSignature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
                    `Window Ethereum Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${windowEthereumSignature.r}`,
                );
                assert(
                    windowEthereumSignature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
                    `Window Ethereum Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${windowEthereumSignature.s}`,
                );
                assert(
                    windowEthereumSignature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
                    `Window Ethereum Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${windowEthereumSignature.v}`,
                );
            });
        });
    });
});

Deno.test("Other tests", async (t) => {
    await t.step(
        "'abstractSignTypedData' should reject if `wallet` option is not an abstract wallet",
        async () => {
            await assertRejects(
                () =>
                    signL1Action({
                        // @ts-ignore - Mock wallet
                        wallet: {},
                        isTestnet: false,
                        action: L1_ACTION_SIGNATURE.data.action,
                        nonce: L1_ACTION_SIGNATURE.data.nonce,
                    }),
                Error,
                "Unsupported wallet for signing typed data",
            );
        },
    );

    await t.step(
        "'signTypedDataWithWindowEthereum' should be rejected if `window.ethereum` returns an empty array of accounts",
        async () => {
            const windowEthereum = {
                // deno-lint-ignore require-await
                request: async (args: { method: string; params: unknown[] }): Promise<unknown> => {
                    if (args.method === "eth_requestAccounts") return [];
                    throw new Error("Request failed");
                },
            };
            await assertRejects(
                () =>
                    signL1Action({
                        wallet: windowEthereum,
                        isTestnet: false,
                        action: L1_ACTION_SIGNATURE.data.action,
                        nonce: L1_ACTION_SIGNATURE.data.nonce,
                    }),
                Error,
                "No Ethereum accounts available",
            );
        },
    );

    await t.step(
        "'signTypedDataWithWindowEthereum' should reject if `window.ethereum` returns an error",
        async () => {
            const windowEthereum = {
                // deno-lint-ignore require-await
                request: async (args: { method: string; params: unknown[] }): Promise<unknown> => {
                    if (args.method === "eth_requestAccounts") return ["0xE5cA49Fb3bD9A581F0D1EF9CB5D7177Da08bf901"];
                    throw new Error("Request failed");
                },
            };
            await assertRejects(
                () =>
                    signL1Action({
                        wallet: windowEthereum,
                        isTestnet: false,
                        action: L1_ACTION_SIGNATURE.data.action,
                        nonce: L1_ACTION_SIGNATURE.data.nonce,
                    }),
                Error,
                "Request failed",
            );
        },
    );
});
