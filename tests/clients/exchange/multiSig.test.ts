import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@2/accounts";
import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";
import { signL1Action, signUserSignedAction } from "../../../src/signing.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;

// —————————— Test ——————————

// NOTE: For simplicity, we will expect a specific error
Deno.test("multiSig", { ignore: !PRIVATE_KEY }, async (t) => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });

    const exchClient_signer1 = privateKeyToAccount(PRIVATE_KEY);
    const exchClient_signer2 = new ExchangeClient({ wallet: exchClient_signer1, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("L1 Action", async (t) => {
        await t.step("with 1 signer", async () => {
            // —————————— Prepare ——————————

            // Preparing a temporary wallet
            const tempPrivKey1 = generatePrivateKey();
            const multiSigUser = privateKeyToAccount(tempPrivKey1);
            const exchClient_multiSigUser = new ExchangeClient({ wallet: multiSigUser, transport, isTestnet: true });

            await exchClient_signer2.usdSend({ destination: multiSigUser.address, amount: "2" });

            await exchClient_multiSigUser.convertToMultiSigUser({
                authorizedUsers: [exchClient_signer1.address],
                threshold: 1,
            });

            // Action
            const nonce = Date.now();
            const action = { type: "scheduleCancel", time: Date.now() + 10000 };

            // Signatures
            const signature1 = await signL1Action({
                wallet: exchClient_signer1,
                action: [multiSigUser.address.toLowerCase(), exchClient_signer1.address.toLowerCase(), action],
                nonce,
                isTestnet: true,
            });

            // —————————— Test ——————————

            await assertRejects(
                async () =>
                    await exchClient_signer2.multiSig({
                        signatures: [signature1],
                        payload: {
                            multiSigUser: multiSigUser.address,
                            outerSigner: exchClient_signer1.address,
                            action,
                        },
                        nonce,
                    }),
                ApiRequestError,
                "Cannot set scheduled cancel time until enough volume traded",
            );
        });

        await t.step("with 2 signers", async () => {
            // —————————— Prepare ——————————

            // Preparing a temporary wallet
            const tempPrivKey1 = generatePrivateKey();
            const multiSigUser = privateKeyToAccount(tempPrivKey1);
            const exchClient_multiSigUser = new ExchangeClient({ wallet: multiSigUser, transport, isTestnet: true });

            const tempPrivKey2 = generatePrivateKey();
            const signer2 = privateKeyToAccount(tempPrivKey2);

            await exchClient_signer2.usdSend({ destination: multiSigUser.address, amount: "2" });
            await exchClient_signer2.usdSend({ destination: signer2.address, amount: "2" });

            await exchClient_multiSigUser.convertToMultiSigUser({
                authorizedUsers: [exchClient_signer1.address, signer2.address],
                threshold: 2,
            });

            // Action
            const nonce = Date.now();
            const action = { type: "scheduleCancel", time: Date.now() + 10000 };

            // Signatures
            const signature1 = await signL1Action({
                wallet: exchClient_signer1,
                action: [multiSigUser.address.toLowerCase(), exchClient_signer1.address.toLowerCase(), action],
                nonce,
                isTestnet: true,
            });
            const signature2 = await signL1Action({
                wallet: signer2,
                action: [multiSigUser.address.toLowerCase(), exchClient_signer1.address.toLowerCase(), action],
                nonce,
                isTestnet: true,
            });

            // —————————— Test ——————————

            await assertRejects(
                async () =>
                    await exchClient_signer2.multiSig({
                        signatures: [signature1, signature2],
                        payload: {
                            multiSigUser: multiSigUser.address,
                            outerSigner: exchClient_signer1.address,
                            action,
                        },
                        nonce,
                    }),
                ApiRequestError,
                "Cannot set scheduled cancel time until enough volume traded",
            );
        });
    });

    await t.step("User Signed Action", async (t) => {
        await t.step("with 1 signer", async () => {
            // —————————— Prepare ——————————

            // Preparing a temporary wallet
            const tempPrivKey1 = generatePrivateKey();
            const multiSigUser = privateKeyToAccount(tempPrivKey1);
            const exchClient_multiSigUser = new ExchangeClient({ wallet: multiSigUser, transport, isTestnet: true });

            await exchClient_signer2.usdSend({ destination: multiSigUser.address, amount: "2" });

            await exchClient_multiSigUser.convertToMultiSigUser({
                authorizedUsers: [exchClient_signer1.address],
                threshold: 1,
            });

            // Action
            const nonce = Date.now();
            const action = {
                type: "usdSend",
                signatureChainId: "0x66eee",
                hyperliquidChain: "Testnet",
                destination: "0x0000000000000000000000000000000000000000",
                amount: "100",
                time: nonce,
            };

            // Signatures
            const signature1 = await signUserSignedAction({
                wallet: exchClient_signer1,
                action: {
                    ...action,
                    payloadMultiSigUser: multiSigUser.address,
                    outerSigner: exchClient_signer1.address,
                },
                types: {
                    "HyperliquidTransaction:UsdSend": [
                        { name: "hyperliquidChain", type: "string" },
                        { name: "payloadMultiSigUser", type: "address" },
                        { name: "outerSigner", type: "address" },
                        { name: "destination", type: "string" },
                        { name: "amount", type: "string" },
                        { name: "time", type: "uint64" },
                    ],
                },
                chainId: 0x66eee,
            });

            // —————————— Test ——————————

            await assertRejects(
                async () =>
                    await exchClient_signer2.multiSig({
                        signatures: [signature1],
                        payload: {
                            multiSigUser: multiSigUser.address,
                            outerSigner: exchClient_signer1.address,
                            action,
                        },
                        nonce,
                    }),
                ApiRequestError,
                "Insufficient balance for withdrawal",
            );
        });

        await t.step("with 2 signer", async () => {
            // —————————— Prepare ——————————

            // Preparing a temporary wallet
            const tempPrivKey1 = generatePrivateKey();
            const multiSigUser = privateKeyToAccount(tempPrivKey1);
            const exchClient_multiSigUser = new ExchangeClient({ wallet: multiSigUser, transport, isTestnet: true });

            const tempPrivKey2 = generatePrivateKey();
            const signer2 = privateKeyToAccount(tempPrivKey2);

            await exchClient_signer2.usdSend({ destination: multiSigUser.address, amount: "2" });
            await exchClient_signer2.usdSend({ destination: signer2.address, amount: "2" });

            await exchClient_multiSigUser.convertToMultiSigUser({
                authorizedUsers: [exchClient_signer1.address, signer2.address],
                threshold: 2,
            });

            // Action
            const nonce = Date.now();
            const action = {
                type: "usdSend",
                signatureChainId: "0x66eee",
                hyperliquidChain: "Testnet",
                destination: "0x0000000000000000000000000000000000000000",
                amount: "100",
                time: nonce,
            };

            // Signatures
            const signature1 = await signUserSignedAction({
                wallet: exchClient_signer1,
                action: {
                    ...action,
                    payloadMultiSigUser: multiSigUser.address,
                    outerSigner: exchClient_signer1.address,
                },
                types: {
                    "HyperliquidTransaction:UsdSend": [
                        { name: "hyperliquidChain", type: "string" },
                        { name: "payloadMultiSigUser", type: "address" },
                        { name: "outerSigner", type: "address" },
                        { name: "destination", type: "string" },
                        { name: "amount", type: "string" },
                        { name: "time", type: "uint64" },
                    ],
                },
                chainId: 0x66eee,
            });
            const signature2 = await signUserSignedAction({
                wallet: signer2,
                action: {
                    ...action,
                    payloadMultiSigUser: multiSigUser.address,
                    outerSigner: exchClient_signer1.address,
                },
                types: {
                    "HyperliquidTransaction:UsdSend": [
                        { name: "hyperliquidChain", type: "string" },
                        { name: "payloadMultiSigUser", type: "address" },
                        { name: "outerSigner", type: "address" },
                        { name: "destination", type: "string" },
                        { name: "amount", type: "string" },
                        { name: "time", type: "uint64" },
                    ],
                },
                chainId: 0x66eee,
            });

            // —————————— Test ——————————

            await assertRejects(
                async () =>
                    await exchClient_signer2.multiSig({
                        signatures: [signature1, signature2],
                        payload: {
                            multiSigUser: multiSigUser.address,
                            outerSigner: exchClient_signer1.address,
                            action,
                        },
                        nonce,
                    }),
                ApiRequestError,
                "Insufficient balance for withdrawal",
            );
        });
    });
});
