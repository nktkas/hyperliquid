import { assert } from "jsr:@std/assert@^1.0.9";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.54/accounts";
import { ethers } from "npm:ethers@^6.13.4";
import { ethers as ethersV5 } from "npm:ethers@5.7.2";
import {
    createActionHash,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    signL1Action,
    signUserSignedAction,
} from "../../src/utils/signing.ts";

Deno.test("Wallet Type Detection Tests", async (t) => {
    const privateKey = generatePrivateKey();
    const viemWallet = privateKeyToAccount(privateKey);
    const ethersWallet = new ethers.Wallet(privateKey);
    const ethersV5Wallet = new ethersV5.Wallet(privateKey);

    await t.step("Viem Wallet", async (t) => {
        await t.step("should correctly identify viem wallet", () => {
            const result = isAbstractViemWalletClient(viemWallet);
            assert(result);
        });

        await t.step("should reject ethers wallet", () => {
            const result = isAbstractViemWalletClient(ethersWallet);
            assert(result === false);
        });

        await t.step("should reject ethers v5 wallet", () => {
            const result = isAbstractViemWalletClient(ethersV5Wallet);
            assert(result === false);
        });
    });

    await t.step("Ethers Wallet", async (t) => {
        await t.step("should correctly identify ethers wallet", () => {
            const result = isAbstractEthersSigner(ethersWallet);
            assert(result);
        });

        await t.step("should reject ethers v5 wallet", () => {
            const result = isAbstractEthersSigner(ethersV5Wallet);
            assert(result === false);
        });

        await t.step("should reject viem wallet", () => {
            const result = isAbstractEthersSigner(viemWallet);
            assert(result === false);
        });
    });

    await t.step("Ethers v5 Wallet", async (t) => {
        await t.step("should correctly identify ethers v5 wallet", () => {
            const result = isAbstractEthersV5Signer(ethersV5Wallet);
            assert(result);
        });

        await t.step("should reject viem wallet", () => {
            const result = isAbstractEthersV5Signer(viemWallet);
            assert(result === false);
        });

        await t.step("should reject ethers wallet", () => {
            const result = isAbstractEthersV5Signer(ethersWallet);
            assert(result === false);
        });
    });
});

Deno.test("Signature Generation Tests", async (t) => {
    const privateKey = "0x822e9959e022b78423eb653a62ea0020cd283e71a2a8133a6ff2aeffaf373cff";
    const l1ActionSignature = {
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
        },
        signature: {
            mainnet: {
                withVaultAddress: {
                    r: "0x77151b3ae29b83c8affb3791568c6452019ba8c30019236003abb1efcd809433",
                    s: "0x55668c02f6ad4a1c335ce99987b7545984c4edc1765fe52cf115a423dc8279bb",
                    v: 27,
                },
                withoutVaultAddress: {
                    r: "0x61078d8ffa3cb591de045438a1ae2ed299b271891d1943a33901e7cfb3a31ed8",
                    s: "0x0e91df4f9841641d3322dad8d932874b74d7e082cdb5b533f804964a6963aef9",
                    v: 28,
                },
            },
            testnet: {
                withVaultAddress: {
                    r: "0x294a6cf713483c129be9af5c7450aca59c9082f391f02325715c0d04b7f48ac1",
                    s: "0x119cfd947dcd2da1d1064a9d08bcf07e01fc9b72dd7cca69a988c74249e300f0",
                    v: 27,
                },
                withoutVaultAddress: {
                    r: "0x6b0283a894d87b996ad0182b86251cc80d27d61ef307449a2ed249a508ded1f7",
                    s: "0x6f884e79f4a0a10af62db831af6f8e03b3f11d899eb49b352f836746ee9226da",
                    v: 27,
                },
            },
        },
        actionHash: {
            withVaultAddress: "0x214e2ea3270981b6fd18174216691e69f56872663139d396b10ded319cb4bb1e",
            withoutVaultAddress: "0x25367e0dba84351148288c2233cd6130ed6cec5967ded0c0b7334f36f957cc90",
        },
    } as const;
    const userSignedActionSignature = {
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

    const viemWallet = privateKeyToAccount(privateKey);
    const ethersWallet = new ethers.Wallet(privateKey);
    const ethersV5Wallet = new ethersV5.Wallet(privateKey);

    await t.step("L1 Action Signatures", async (t) => {
        await t.step("Action Hash", async (t) => {
            await t.step("should generate matching action hashes", async (t) => {
                await t.step("with VaultAddress", () => {
                    const viemHash = createActionHash(
                        l1ActionSignature.data.action,
                        l1ActionSignature.data.nonce,
                        l1ActionSignature.data.vaultAddress,
                    );

                    const ethersHash = createActionHash(
                        l1ActionSignature.data.action,
                        l1ActionSignature.data.nonce,
                        l1ActionSignature.data.vaultAddress,
                    );

                    const ethersV5Hash = createActionHash(
                        l1ActionSignature.data.action,
                        l1ActionSignature.data.nonce,
                        l1ActionSignature.data.vaultAddress,
                    );

                    assert(
                        viemHash === l1ActionSignature.actionHash.withVaultAddress,
                        `Viem Hash does not match, expected: ${l1ActionSignature.actionHash.withVaultAddress}, got: ${viemHash}`,
                    );
                    assert(
                        ethersHash === l1ActionSignature.actionHash.withVaultAddress,
                        `Ethers Hash does not match, expected: ${l1ActionSignature.actionHash.withVaultAddress}, got: ${ethersHash}`,
                    );
                    assert(
                        ethersV5Hash === l1ActionSignature.actionHash.withVaultAddress,
                        `Ethers v5 Hash does not match, expected: ${l1ActionSignature.actionHash.withVaultAddress}, got: ${ethersV5Hash}`,
                    );
                });

                await t.step("without VaultAddress", () => {
                    const viemHash = createActionHash(
                        l1ActionSignature.data.action,
                        l1ActionSignature.data.nonce,
                    );

                    const ethersHash = createActionHash(
                        l1ActionSignature.data.action,
                        l1ActionSignature.data.nonce,
                    );

                    const ethersV5Hash = createActionHash(
                        l1ActionSignature.data.action,
                        l1ActionSignature.data.nonce,
                    );

                    assert(
                        viemHash === l1ActionSignature.actionHash.withoutVaultAddress,
                        `Viem Hash does not match, expected: ${l1ActionSignature.actionHash.withoutVaultAddress}, got: ${viemHash}`,
                    );
                    assert(
                        ethersHash === l1ActionSignature.actionHash.withoutVaultAddress,
                        `Ethers Hash does not match, expected: ${l1ActionSignature.actionHash.withoutVaultAddress}, got: ${ethersHash}`,
                    );
                    assert(
                        ethersV5Hash === l1ActionSignature.actionHash.withoutVaultAddress,
                        `Ethers v5 Hash does not match, expected: ${l1ActionSignature.actionHash.withoutVaultAddress}, got: ${ethersV5Hash}`,
                    );
                });
            });
        });

        await t.step("Signatures", async (t) => {
            await t.step("should generate matching signatures", async (t) => {
                await t.step("in mainnet", async (t) => {
                    await t.step("with VaultAddress", async () => {
                        const viemSignature = await signL1Action(
                            viemWallet,
                            false,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                            l1ActionSignature.data.vaultAddress,
                        );

                        const ethersSignature = await signL1Action(
                            ethersWallet,
                            false,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                            l1ActionSignature.data.vaultAddress,
                        );

                        const ethersV5Signature = await signL1Action(
                            ethersV5Wallet,
                            false,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                            l1ActionSignature.data.vaultAddress,
                        );

                        assert(
                            viemSignature.r === l1ActionSignature.signature.mainnet.withVaultAddress.r,
                            `Viem Signature r does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.r}, got: ${viemSignature.r}`,
                        );
                        assert(
                            viemSignature.s === l1ActionSignature.signature.mainnet.withVaultAddress.s,
                            `Viem Signature s does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.s}, got: ${viemSignature.s}`,
                        );
                        assert(
                            viemSignature.v === l1ActionSignature.signature.mainnet.withVaultAddress.v,
                            `Viem Signature v does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.v}, got: ${viemSignature.v}`,
                        );

                        assert(
                            ethersSignature.r === l1ActionSignature.signature.mainnet.withVaultAddress.r,
                            `Ethers Signature r does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.r}, got: ${ethersSignature.r}`,
                        );
                        assert(
                            ethersSignature.s === l1ActionSignature.signature.mainnet.withVaultAddress.s,
                            `Ethers Signature s does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.s}, got: ${ethersSignature.s}`,
                        );
                        assert(
                            ethersSignature.v === l1ActionSignature.signature.mainnet.withVaultAddress.v,
                            `Ethers Signature v does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.v}, got: ${ethersSignature.v}`,
                        );

                        assert(
                            ethersV5Signature.r === l1ActionSignature.signature.mainnet.withVaultAddress.r,
                            `Ethers v5 Signature r does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.r}, got: ${ethersV5Signature.r}`,
                        );
                        assert(
                            ethersV5Signature.s === l1ActionSignature.signature.mainnet.withVaultAddress.s,
                            `Ethers v5 Signature s does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.s}, got: ${ethersV5Signature.s}`,
                        );
                        assert(
                            ethersV5Signature.v === l1ActionSignature.signature.mainnet.withVaultAddress.v,
                            `Ethers v5 Signature v does not match, expected: ${l1ActionSignature.signature.mainnet.withVaultAddress.v}, got: ${ethersV5Signature.v}`,
                        );
                    });

                    await t.step("without VaultAddress", async () => {
                        const viemSignature = await signL1Action(
                            viemWallet,
                            false,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                        );

                        const ethersSignature = await signL1Action(
                            ethersWallet,
                            false,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                        );

                        const ethersV5Signature = await signL1Action(
                            ethersV5Wallet,
                            false,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                        );

                        assert(
                            viemSignature.r === l1ActionSignature.signature.mainnet.withoutVaultAddress.r,
                            `Viem Signature r does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.r}, got: ${viemSignature.r}`,
                        );
                        assert(
                            viemSignature.s === l1ActionSignature.signature.mainnet.withoutVaultAddress.s,
                            `Viem Signature s does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.s}, got: ${viemSignature.s}`,
                        );
                        assert(
                            viemSignature.v === l1ActionSignature.signature.mainnet.withoutVaultAddress.v,
                            `Viem Signature v does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.v}, got: ${viemSignature.v}`,
                        );

                        assert(
                            ethersSignature.r === l1ActionSignature.signature.mainnet.withoutVaultAddress.r,
                            `Ethers Signature r does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.r}, got: ${ethersSignature.r}`,
                        );
                        assert(
                            ethersSignature.s === l1ActionSignature.signature.mainnet.withoutVaultAddress.s,
                            `Ethers Signature s does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.s}, got: ${ethersSignature.s}`,
                        );
                        assert(
                            ethersSignature.v === l1ActionSignature.signature.mainnet.withoutVaultAddress.v,
                            `Ethers Signature v does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.v}, got: ${ethersSignature.v}`,
                        );

                        assert(
                            ethersV5Signature.r === l1ActionSignature.signature.mainnet.withoutVaultAddress.r,
                            `Ethers v5 Signature r does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.r}, got: ${ethersV5Signature.r}`,
                        );
                        assert(
                            ethersV5Signature.s === l1ActionSignature.signature.mainnet.withoutVaultAddress.s,
                            `Ethers v5 Signature s does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.s}, got: ${ethersV5Signature.s}`,
                        );
                        assert(
                            ethersV5Signature.v === l1ActionSignature.signature.mainnet.withoutVaultAddress.v,
                            `Ethers v5 Signature v does not match, expected: ${l1ActionSignature.signature.mainnet.withoutVaultAddress.v}, got: ${ethersV5Signature.v}`,
                        );
                    });
                });

                await t.step("in testnet", async (t) => {
                    await t.step("with VaultAddress", async () => {
                        const viemSignature = await signL1Action(
                            viemWallet,
                            true,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                            l1ActionSignature.data.vaultAddress,
                        );

                        const ethersSignature = await signL1Action(
                            ethersWallet,
                            true,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                            l1ActionSignature.data.vaultAddress,
                        );

                        const ethersV5Signature = await signL1Action(
                            ethersV5Wallet,
                            true,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                            l1ActionSignature.data.vaultAddress,
                        );

                        assert(
                            viemSignature.r === l1ActionSignature.signature.testnet.withVaultAddress.r,
                            `Viem Signature r does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.r}, got: ${viemSignature.r}`,
                        );
                        assert(
                            viemSignature.s === l1ActionSignature.signature.testnet.withVaultAddress.s,
                            `Viem Signature s does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.s}, got: ${viemSignature.s}`,
                        );
                        assert(
                            viemSignature.v === l1ActionSignature.signature.testnet.withVaultAddress.v,
                            `Viem Signature v does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.v}, got: ${viemSignature.v}`,
                        );

                        assert(
                            ethersSignature.r === l1ActionSignature.signature.testnet.withVaultAddress.r,
                            `Ethers Signature r does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.r}, got: ${ethersSignature.r}`,
                        );
                        assert(
                            ethersSignature.s === l1ActionSignature.signature.testnet.withVaultAddress.s,
                            `Ethers Signature s does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.s}, got: ${ethersSignature.s}`,
                        );
                        assert(
                            ethersSignature.v === l1ActionSignature.signature.testnet.withVaultAddress.v,
                            `Ethers Signature v does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.v}, got: ${ethersSignature.v}`,
                        );

                        assert(
                            ethersV5Signature.r === l1ActionSignature.signature.testnet.withVaultAddress.r,
                            `Ethers v5 Signature r does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.r}, got: ${ethersV5Signature.r}`,
                        );
                        assert(
                            ethersV5Signature.s === l1ActionSignature.signature.testnet.withVaultAddress.s,
                            `Ethers v5 Signature s does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.s}, got: ${ethersV5Signature.s}`,
                        );
                        assert(
                            ethersV5Signature.v === l1ActionSignature.signature.testnet.withVaultAddress.v,
                            `Ethers v5 Signature v does not match, expected: ${l1ActionSignature.signature.testnet.withVaultAddress.v}, got: ${ethersV5Signature.v}`,
                        );
                    });

                    await t.step("without VaultAddress", async () => {
                        const viemSignature = await signL1Action(
                            viemWallet,
                            true,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                        );

                        const ethersSignature = await signL1Action(
                            ethersWallet,
                            true,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                        );

                        const ethersV5Signature = await signL1Action(
                            ethersV5Wallet,
                            true,
                            l1ActionSignature.data.action,
                            l1ActionSignature.data.nonce,
                        );

                        assert(
                            viemSignature.r === l1ActionSignature.signature.testnet.withoutVaultAddress.r,
                            `Viem Signature r does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.r}, got: ${viemSignature.r}`,
                        );
                        assert(
                            viemSignature.s === l1ActionSignature.signature.testnet.withoutVaultAddress.s,
                            `Viem Signature s does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.s}, got: ${viemSignature.s}`,
                        );
                        assert(
                            viemSignature.v === l1ActionSignature.signature.testnet.withoutVaultAddress.v,
                            `Viem Signature v does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.v}, got: ${viemSignature.v}`,
                        );

                        assert(
                            ethersSignature.r === l1ActionSignature.signature.testnet.withoutVaultAddress.r,
                            `Ethers Signature r does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.r}, got: ${ethersSignature.r}`,
                        );
                        assert(
                            ethersSignature.s === l1ActionSignature.signature.testnet.withoutVaultAddress.s,
                            `Ethers Signature s does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.s}, got: ${ethersSignature.s}`,
                        );
                        assert(
                            ethersSignature.v === l1ActionSignature.signature.testnet.withoutVaultAddress.v,
                            `Ethers Signature v does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.v}, got: ${ethersSignature.v}`,
                        );

                        assert(
                            ethersV5Signature.r === l1ActionSignature.signature.testnet.withoutVaultAddress.r,
                            `Ethers v5 Signature r does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.r}, got: ${ethersV5Signature.r}`,
                        );
                        assert(
                            ethersV5Signature.s === l1ActionSignature.signature.testnet.withoutVaultAddress.s,
                            `Ethers v5 Signature s does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.s}, got: ${ethersV5Signature.s}`,
                        );
                        assert(
                            ethersV5Signature.v === l1ActionSignature.signature.testnet.withoutVaultAddress.v,
                            `Ethers v5 Signature v does not match, expected: ${l1ActionSignature.signature.testnet.withoutVaultAddress.v}, got: ${ethersV5Signature.v}`,
                        );
                    });
                });
            });
        });
    });

    await t.step("User-Signed Action Signatures", async (t) => {
        const viemSignature = await signUserSignedAction(
            viemWallet,
            userSignedActionSignature.data.action,
            [...userSignedActionSignature.data.payloadTypes],
            userSignedActionSignature.data.primaryType,
            userSignedActionSignature.data.chainId,
        );
        const ethersSignature = await signUserSignedAction(
            ethersWallet,
            userSignedActionSignature.data.action,
            [...userSignedActionSignature.data.payloadTypes],
            userSignedActionSignature.data.primaryType,
            userSignedActionSignature.data.chainId,
        );
        const ethersV5Signature = await signUserSignedAction(
            ethersV5Wallet,
            userSignedActionSignature.data.action,
            [...userSignedActionSignature.data.payloadTypes],
            userSignedActionSignature.data.primaryType,
            userSignedActionSignature.data.chainId,
        );

        await t.step("should generate matching signatures", () => {
            assert(
                viemSignature.r === userSignedActionSignature.signature.r,
                `Viem Signature r does not match, expected: ${userSignedActionSignature.signature.r}, got: ${viemSignature.r}`,
            );
            assert(
                viemSignature.s === userSignedActionSignature.signature.s,
                `Viem Signature s does not match, expected: ${userSignedActionSignature.signature.s}, got: ${viemSignature.s}`,
            );
            assert(
                viemSignature.v === userSignedActionSignature.signature.v,
                `Viem Signature v does not match, expected: ${userSignedActionSignature.signature.v}, got: ${viemSignature.v}`,
            );

            assert(
                ethersSignature.r === userSignedActionSignature.signature.r,
                `Ethers Signature r does not match, expected: ${userSignedActionSignature.signature.r}, got: ${ethersSignature.r}`,
            );
            assert(
                ethersSignature.s === userSignedActionSignature.signature.s,
                `Ethers Signature s does not match, expected: ${userSignedActionSignature.signature.s}, got: ${ethersSignature.s}`,
            );
            assert(
                ethersSignature.v === userSignedActionSignature.signature.v,
                `Ethers Signature v does not match, expected: ${userSignedActionSignature.signature.v}, got: ${ethersSignature.v}`,
            );

            assert(
                ethersV5Signature.r === userSignedActionSignature.signature.r,
                `Ethers v5 Signature r does not match, expected: ${userSignedActionSignature.signature.r}, got: ${ethersV5Signature.r}`,
            );
            assert(
                ethersV5Signature.s === userSignedActionSignature.signature.s,
                `Ethers v5 Signature s does not match, expected: ${userSignedActionSignature.signature.s}, got: ${ethersV5Signature.s}`,
            );
            assert(
                ethersV5Signature.v === userSignedActionSignature.signature.v,
                `Ethers v5 Signature v does not match, expected: ${userSignedActionSignature.signature.v}, got: ${ethersV5Signature.v}`,
            );
        });
    });
});
