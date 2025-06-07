import { assert, assertRejects } from "jsr:@std/assert@1";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { ethers } from "npm:ethers@6";
import { ethers as ethersV5 } from "npm:ethers@5";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWindowEthereum,
    createL1ActionHash,
    signL1Action,
    signUserSignedAction,
} from "../../src/signing.ts";

// —————————— Arguments ——————————

const PRIVATE_KEY = "0x822e9959e022b78423eb653a62ea0020cd283e71a2a8133a6ff2aeffaf373cff";
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
        },
        nonce: 1234567890,
        vaultAddress: "0x1234567890123456789012345678901234567890",
        expiresAfter: 1234567890,
    },
    signature: {
        mainnet: {
            withoutVaultAddressAndExpiresAfter: {
                r: "0x61078d8ffa3cb591de045438a1ae2ed299b271891d1943a33901e7cfb3a31ed8",
                s: "0x0e91df4f9841641d3322dad8d932874b74d7e082cdb5b533f804964a6963aef9",
                v: 28,
            },
            withVaultAddress: {
                r: "0x77151b3ae29b83c8affb3791568c6452019ba8c30019236003abb1efcd809433",
                s: "0x55668c02f6ad4a1c335ce99987b7545984c4edc1765fe52cf115a423dc8279bb",
                v: 27,
            },
            withExpiresAfter: {
                r: "0x162a52128fb58bc6adb783e3d36913c53127851144fc45c5603a51e97b9202fd",
                s: "0x469571eb0a2101a32f81f9584e15fd35c723a6089e106f4f33798dbccf7cd416",
                v: 28,
            },
            withVaultAddressAndExpiresAfter: {
                r: "0x78fcca006d7fdfaf1f66978ef7a60280246fc3e7a5b39a68a1656c3e42c58bf1",
                s: "0x61a09957de7f0886c2bdffb7a94e3a257bf240796883ea6ceaf4d0be37055cdd",
                v: 27,
            },
        },
        testnet: {
            withoutVaultAddressAndExpiresAfter: {
                r: "0x6b0283a894d87b996ad0182b86251cc80d27d61ef307449a2ed249a508ded1f7",
                s: "0x6f884e79f4a0a10af62db831af6f8e03b3f11d899eb49b352f836746ee9226da",
                v: 27,
            },
            withVaultAddress: {
                r: "0x294a6cf713483c129be9af5c7450aca59c9082f391f02325715c0d04b7f48ac1",
                s: "0x119cfd947dcd2da1d1064a9d08bcf07e01fc9b72dd7cca69a988c74249e300f0",
                v: 27,
            },
            withExpiresAfter: {
                r: "0x5094989a7c0317db6553f21dd7f90d43415e8bd01af03829de249d4ea0aa5f66",
                s: "0x491d04966e81662bd4e70d607fac30e71803c01733f4f66ff7299b0470675b8b",
                v: 27,
            },
            withVaultAddressAndExpiresAfter: {
                r: "0x3a0bbbd9fadca54f58a2b7050899cecb97f68b2f693c63e91ca60510427326d7",
                s: "0x60f75f12cae7b9dc18b889406192afcaf13f40d2f8c68cc01f7f83f3fb5deb23",
                v: 27,
            },
        },
    },
    actionHash: {
        withoutVaultAddressAndExpiresAfter: "0x25367e0dba84351148288c2233cd6130ed6cec5967ded0c0b7334f36f957cc90",
        withVaultAddress: "0x214e2ea3270981b6fd18174216691e69f56872663139d396b10ded319cb4bb1e",
        withExpiresAfter: "0xc30b002ba3775e4c31c43c1dfd3291dfc85c6ae06c6b9f393991de86cad5fac7",
        withVaultAddressAndExpiresAfter: "0x2d62412aa0fc57441b5189841d81554a6a9680bf07204e1454983a9ca44f0744",
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
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withExpiresAfter) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withVaultAddressAndExpiresAfter) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v.toString(16);
                        }
                        throw new Error(
                            `Invalid connectionId, expected: ${L1_ACTION_SIGNATURE.actionHash.withVaultAddress} or ${L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter}, got: ${connectionId}`,
                        );
                    }
                    if (source === "b") {
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withVaultAddress) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withExpiresAfter) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v.toString(16);
                        }
                        if (connectionId === L1_ACTION_SIGNATURE.actionHash.withVaultAddressAndExpiresAfter) {
                            return "0x" +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s.slice(2) +
                                L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v.toString(16);
                        }
                        throw new Error(
                            `Invalid connectionId, expected: ${L1_ACTION_SIGNATURE.actionHash.withVaultAddress} or ${L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter}, got: ${connectionId}`,
                        );
                    }
                    throw new Error(`Invalid source, expected: a or b, got: ${source}`);
                }
                if (domainName === "HyperliquidSignTransaction") {
                    return "0x" +
                        USER_SIGNED_ACTION_SIGNATURE.signature.r.slice(2) +
                        USER_SIGNED_ACTION_SIGNATURE.signature.s.slice(2) +
                        USER_SIGNED_ACTION_SIGNATURE.signature.v.toString(16);
                }
                throw new Error(`Invalid domain, expected: Exchange or HyperliquidSignTransaction, got: ${domainName}`);
            }
        },
    };

    await t.step("L1 Action Signatures", async (t) => {
        await t.step("Action Hash", async (t) => {
            await t.step("should generate matching action hashes", async (t) => {
                await t.step("without vaultAddress + expiresAfter", () => {
                    const actionHash = createL1ActionHash(
                        L1_ACTION_SIGNATURE.data.action,
                        L1_ACTION_SIGNATURE.data.nonce,
                    );
                    assert(
                        actionHash === L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter,
                        `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withoutVaultAddressAndExpiresAfter}, got: ${actionHash}`,
                    );
                });
                await t.step("with vaultAddress", () => {
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
                await t.step("with expiresAfter", () => {
                    const actionHash = createL1ActionHash(
                        L1_ACTION_SIGNATURE.data.action,
                        L1_ACTION_SIGNATURE.data.nonce,
                        undefined,
                        L1_ACTION_SIGNATURE.data.expiresAfter,
                    );
                    assert(
                        actionHash === L1_ACTION_SIGNATURE.actionHash.withExpiresAfter,
                        `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withExpiresAfter}, got: ${actionHash}`,
                    );
                });
                await t.step("with vaultAddress + expiresAfter", () => {
                    const actionHash = createL1ActionHash(
                        L1_ACTION_SIGNATURE.data.action,
                        L1_ACTION_SIGNATURE.data.nonce,
                        L1_ACTION_SIGNATURE.data.vaultAddress,
                        L1_ACTION_SIGNATURE.data.expiresAfter,
                    );
                    assert(
                        actionHash === L1_ACTION_SIGNATURE.actionHash.withVaultAddressAndExpiresAfter,
                        `Hash does not match, expected: ${L1_ACTION_SIGNATURE.actionHash.withVaultAddressAndExpiresAfter}, got: ${actionHash}`,
                    );
                });
            });
        });

        await t.step("Signatures", async (t) => {
            await t.step("should generate matching signatures", async (t) => {
                await t.step("in mainnet", async (t) => {
                    await t.step("without vaultAddress + expiresAfter", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                signature.r ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withoutVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                    await t.step("with vaultAddress", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                signature.r === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v === L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddress.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                    await t.step("with expiresAfter", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
                            });
                            assert(
                                signature.r === L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s === L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v === L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withExpiresAfter.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                    await t.step("with vaultAddress + expiresAfter", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: false,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
                            });
                            assert(
                                signature.r ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v ===
                                    L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.mainnet.withVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                });

                await t.step("in testnet", async (t) => {
                    await t.step("without vaultAddress + expiresAfter", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                            });
                            assert(
                                signature.r ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withoutVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                    await t.step("with vaultAddress", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                            });
                            assert(
                                signature.r === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v === L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddress.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                    await t.step("with expiresAfter", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
                            });
                            assert(
                                signature.r === L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s === L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v === L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withExpiresAfter.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                    await t.step("with vaultAddress + expiresAfter", async (t) => {
                        const fn = async (
                            wallet:
                                | AbstractViemWalletClient
                                | AbstractEthersSigner
                                | AbstractEthersV5Signer
                                | AbstractWindowEthereum,
                        ) => {
                            const signature = await signL1Action({
                                wallet,
                                isTestnet: true,
                                action: L1_ACTION_SIGNATURE.data.action,
                                nonce: L1_ACTION_SIGNATURE.data.nonce,
                                vaultAddress: L1_ACTION_SIGNATURE.data.vaultAddress,
                                expiresAfter: L1_ACTION_SIGNATURE.data.expiresAfter,
                            });
                            assert(
                                signature.r ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r,
                                `Signature r does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.r}, got: ${signature.r}`,
                            );
                            assert(
                                signature.s ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s,
                                `Signature s does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.s}, got: ${signature.s}`,
                            );
                            assert(
                                signature.v ===
                                    L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v,
                                `Signature v does not match, expected: ${L1_ACTION_SIGNATURE.signature.testnet.withVaultAddressAndExpiresAfter.v}, got: ${signature.v}`,
                            );
                        };

                        await t.step("Viem", async () => await fn(viemWallet));
                        await t.step("Extended Viem", async () => await fn(extendedViemWallet));
                        await t.step("Ethers", async () => await fn(ethersWallet));
                        await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
                        await t.step("window.ethereum", async () => await fn(windowEthereum));
                    });
                });
            });
        });
    });

    await t.step("User-Signed Action Signatures", async (t) => {
        await t.step("should generate matching signatures", async (t) => {
            const fn = async (
                wallet:
                    | AbstractViemWalletClient
                    | AbstractEthersSigner
                    | AbstractEthersV5Signer
                    | AbstractWindowEthereum,
            ) => {
                const signature = await signUserSignedAction({
                    wallet,
                    action: USER_SIGNED_ACTION_SIGNATURE.data.action,
                    types: {
                        [USER_SIGNED_ACTION_SIGNATURE.data.primaryType]: [
                            ...USER_SIGNED_ACTION_SIGNATURE.data.payloadTypes,
                        ],
                    },
                    chainId: USER_SIGNED_ACTION_SIGNATURE.data.chainId,
                });
                assert(
                    signature.r === USER_SIGNED_ACTION_SIGNATURE.signature.r,
                    `Signature r does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.r}, got: ${signature.r}`,
                );
                assert(
                    signature.s === USER_SIGNED_ACTION_SIGNATURE.signature.s,
                    `Signature s does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.s}, got: ${signature.s}`,
                );
                assert(
                    signature.v === USER_SIGNED_ACTION_SIGNATURE.signature.v,
                    `Signature v does not match, expected: ${USER_SIGNED_ACTION_SIGNATURE.signature.v}, got: ${signature.v}`,
                );
            };

            await t.step("Viem", async () => await fn(viemWallet));
            await t.step("Extended Viem", async () => await fn(extendedViemWallet));
            await t.step("Ethers", async () => await fn(ethersWallet));
            await t.step("Ethers v5", async () => await fn(ethersV5Wallet));
            await t.step("window.ethereum", async () => await fn(windowEthereum));
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
