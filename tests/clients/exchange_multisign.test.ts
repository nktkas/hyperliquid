import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import type { SchemaObject } from "npm:ajv@8";
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { assertEquals, assertIsError, assertRejects } from "jsr:@std/assert@1";
import { createWalletClient, http } from "npm:viem@2";
import { mainnet } from "npm:viem@2/chains";
import { ethers } from "npm:ethers@6";
import { ApiRequestError, ExchangeClient, type Hex, HttpTransport, InfoClient, MultiSignClient } from "../../mod.ts";
import { actionSorter, signL1Action, signUserSignedAction } from "../../src/signing/mod.ts";
import { schemaGenerator } from "../_utils/schema/schemaGenerator.ts";
import { schemaCoverage, SchemaCoverageError } from "../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, generateEthereumAddress, getAssetData, randomCloid } from "../_utils/utils.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 3000 }, string: ["_"] }) as Args<{
    /** Delay to avoid rate limits */
    wait: number;
}>;

const PRIVATE_KEY = cliArgs._[0] as Hex; // must be sole signer for a multi-sign account
const MULTI_SIGN_ADDRESS = "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83"; // replace with your multi-sign address

const METHODS_TO_TEST = [ // controls which tests to run
    "approveAgent",
    "approveBuilderFee",
    "batchModify",
    "cancel",
    "cancelByCloid",
    "cDeposit",
    "claimRewards",
    "convertToMultiSigUser",
    "createSubAccount",
    "createVault",
    "cSignerAction",
    "cValidatorAction",
    "cWithdraw",
    "evmUserModify",
    "modify",
    "multiSig",
    "order",
    "perpDeploy",
    "perpDexClassTransfer",
    "perpDexTransfer",
    "registerReferrer",
    "reserveRequestWeight",
    "scheduleCancel",
    "setDisplayName",
    "setReferrer",
    "spotDeploy",
    "spotSend",
    "spotUser",
    "subAccountSpotTransfer",
    "subAccountTransfer",
    "tokenDelegate",
    "twapCancel",
    "twapOrder",
    "updateIsolatedMargin",
    "updateLeverage",
    "usdClassTransfer",
    "usdSend",
    "vaultDistribute",
    "vaultModify",
    "vaultTransfer",
    "withdraw3",
    "_guessSignatureChainId",
    "_validateResponse",
];
const SKIP_METHODS_FOR_MULTISIGN = [ // FIXME: enable tests for `multisign` mode
    "convertToMultiSigUser",
    "multiSig",
];

// —————————— Tests ——————————

const transport = new HttpTransport({ isTestnet: true });
const infoClient = new InfoClient({ transport });
const exchClient = new ExchangeClient({ wallet: PRIVATE_KEY, transport, isTestnet: true });
const multiSignClient = new MultiSignClient({
    transport,
    multiSignAddress: MULTI_SIGN_ADDRESS,
    signers: [PRIVATE_KEY],
    isTestnet: true,
});

function run<T extends Record<string, unknown>>(
    name: string,
    fn: (types: SchemaObject, mode: "normal" | "multisign", args: T, t: Deno.TestContext) => Promise<void>,
    args: T = {} as T,
) {
    const MethodReturnType = schemaGenerator(import.meta.url, `MethodReturnType_${name}`);
    Deno.test(
        name,
        { ignore: !METHODS_TO_TEST.includes(name) || !PRIVATE_KEY },
        async (t) => {
            for (const mode of ["normal", "multisign"] as const) {
                await t.step({
                    name: mode,
                    ignore: mode === "multisign" && SKIP_METHODS_FOR_MULTISIGN.includes(name),
                    fn: async (t) => {
                        await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits
                        await fn(MethodReturnType, mode, args, t);
                    },
                });
            }
        },
    );
}

export type MethodReturnType_approveAgent = Awaited<ReturnType<ExchangeClient["approveAgent"]>>;
run(
    "approveAgent",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data1 = await client.approveAgent({
            agentAddress: generateEthereumAddress(),
            agentName: "agentName",
        });
        await new Promise((r) => setTimeout(r, 5000)); // to avoid error: User has pending agent removal
        const data2 = await client.approveAgent({
            agentAddress: generateEthereumAddress(),
        });
        schemaCoverage(types, [data1, data2]);
    },
);

export type MethodReturnType_approveBuilderFee = Awaited<ReturnType<ExchangeClient["approveBuilderFee"]>>;
run(
    "approveBuilderFee",
    async (types, mode, { builder }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.approveBuilderFee({ maxFeeRate: "0.001%", builder });
        schemaCoverage(types, [data]);
    },
    { builder: "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83" } as const,
);

export type MethodReturnType_batchModify = Awaited<ReturnType<ExchangeClient["batchModify"]>>;
run(
    "batchModify",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        async function openOrder(
            client: ExchangeClient,
            id: number,
            pxDown: string,
            sz: string,
        ): Promise<{ oid: number; cloid: Hex }> {
            const cloid = randomCloid();
            const orderResp = await client.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: cloid,
                }],
                grouping: "na",
            });
            const [order] = orderResp.response.data.statuses;
            return {
                oid: "resting" in order ? order.resting.oid : order.filled.oid,
                cloid: "resting" in order ? order.resting.cloid! : order.filled.cloid!,
            };
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        try {
            const data = await Promise.all([
                // Check response 'resting' + argument 'expiresAfter'
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                        },
                    }],
                    expiresAfter: Date.now() + 1000 * 60 * 60,
                }),
                // Check response 'resting' + `cloid`
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                            c: randomCloid(),
                        },
                    }],
                }),
                // Check response 'resting' + argument `oid` as cloid
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).cloid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                        },
                    }],
                }),
                // Check response 'filled'
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxUp,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                        },
                    }],
                }),
                // Check response 'filled' + `cloid`
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxUp,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                            c: randomCloid(),
                        },
                    }],
                }),
                // Check argument 't.trigger'
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: {
                                trigger: {
                                    isMarket: false,
                                    tpsl: "tp",
                                    triggerPx: pxDown,
                                },
                            },
                        },
                    }],
                }),
            ]);
            schemaCoverage(types, data);
        } finally {
            // —————————— Cleanup ——————————

            const openOrders = await infoClient.openOrders({
                user: mode === "normal" ? privateKeyToAddress(exchClient.wallet) : multiSignClient.multiSignAddress,
            });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await client.cancel({ cancels });

            await client.order({
                orders: [{
                    a: id,
                    b: false,
                    p: pxDown,
                    s: "0", // Full position size
                    r: true,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            });
        }
    },
    { asset: "BTC" },
);

export type MethodReturnType_cancel = Awaited<ReturnType<ExchangeClient["cancel"]>>;
run(
    "cancel",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string): Promise<number> {
            await client.updateLeverage({ asset: id, isCross: true, leverage: 3 });
            const openOrderRes = await client.order({
                orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            });
            const [order] = openOrderRes.response.data.statuses;
            return "resting" in order ? order.resting.oid : order.filled.oid;
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await Promise.all([
            // Check response 'success'
            client.cancel({
                cancels: [{
                    a: id,
                    o: await openOrder(client, id, pxDown, sz),
                }],
            }),
            // Check argument 'expiresAfter'
            client.cancel({
                cancels: [{
                    a: id,
                    o: await openOrder(client, id, pxDown, sz),
                }],
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { asset: "BTC" },
);

export type MethodReturnType_cancelByCloid = Awaited<ReturnType<ExchangeClient["cancelByCloid"]>>;
run(
    "cancelByCloid",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string): Promise<Hex> {
            await client.updateLeverage({ asset: id, isCross: true, leverage: 3 });
            const openOrderRes = await client.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: randomCloid(),
                }],
                grouping: "na",
            });
            const [order] = openOrderRes.response.data.statuses;
            return "resting" in order ? order.resting.cloid! : order.filled.cloid!;
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await Promise.all([
            // Check response 'success'
            client.cancelByCloid({
                cancels: [{
                    asset: id,
                    cloid: await openOrder(client, id, pxDown, sz),
                }],
            }),
            // Check argument 'expiresAfter'
            client.cancelByCloid({
                cancels: [{
                    asset: id,
                    cloid: await openOrder(client, id, pxDown, sz),
                }],
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { asset: "BTC" },
);

export type MethodReturnType_cDeposit = Awaited<ReturnType<ExchangeClient["cDeposit"]>>;
run(
    "cDeposit",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.cDeposit({ wei: 1 });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_claimRewards = Awaited<ReturnType<ExchangeClient["claimRewards"]>>;
run(
    "claimRewards",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await client.claimRewards()
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "No rewards to claim");
            });
    },
);

export type MethodReturnType_convertToMultiSigUser = Awaited<ReturnType<ExchangeClient["convertToMultiSigUser"]>>;
run(
    "convertToMultiSigUser",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        const tempExchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport, isTestnet: true });
        const tempMultiSignClient = new MultiSignClient({
            transport,
            multiSignAddress: privateKeyToAddress(tempExchClient.wallet),
            signers: [PRIVATE_KEY],
            isTestnet: true,
        });
        await client.usdSend({ destination: privateKeyToAddress(tempExchClient.wallet), amount: "2" });

        // —————————— Test ——————————

        const data1 = await tempExchClient.convertToMultiSigUser({
            authorizedUsers: [
                mode === "normal" ? privateKeyToAddress(exchClient.wallet) : multiSignClient.multiSignAddress,
            ],
            threshold: 1,
        });
        const data2 = await tempMultiSignClient.convertToMultiSigUser(null);
        schemaCoverage(types, [data1, data2]);
    },
);

export type MethodReturnType_createSubAccount = Awaited<ReturnType<ExchangeClient["createSubAccount"]>>;
run(
    "createSubAccount",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await client.createSubAccount({ name: String(Date.now()) })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch(async (e) => {
                if (e instanceof SchemaCoverageError) throw e;
                await Promise.any([
                    () => assertIsError(e, ApiRequestError, "Too many sub-accounts"),
                    () => assertIsError(e, ApiRequestError, "Cannot create sub-accounts until enough volume traded"),
                ]);
            });
    },
);

export type MethodReturnType_createVault = Awaited<ReturnType<ExchangeClient["createVault"]>>;
run(
    "createVault",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await client.createVault({ name: "", description: "", initialUsd: 50 * 1e6 })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Initial deposit in vault is less than $100");
            });
    },
);

export type MethodReturnType_cSignerAction = Awaited<ReturnType<ExchangeClient["cSignerAction"]>>;
run(
    "cSignerAction",
    async (_types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await Promise.all([
            assertRejects(
                () => client.cSignerAction({ jailSelf: null }),
                ApiRequestError,
                "Signer invalid or inactive for current epoch",
            ),
            assertRejects(
                () => client.cSignerAction({ unjailSelf: null }),
                ApiRequestError,
                "Signer invalid or inactive for current epoch",
            ),
        ]);
    },
);

export type MethodReturnType_cValidatorAction = Awaited<ReturnType<ExchangeClient["cValidatorAction"]>>;
run(
    "cValidatorAction",
    async (_types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await Promise.all([
            assertRejects(
                () => client.cValidatorAction({ changeProfile: { unjailed: false } }),
                ApiRequestError,
                "Unknown validator",
            ),
            assertRejects(
                () =>
                    client.cValidatorAction({
                        register: {
                            profile: {
                                node_ip: { Ip: "1.2.3.4" },
                                name: "...",
                                description: "...",
                                delegations_disabled: true,
                                commission_bps: 1,
                                signer: "0x0000000000000000000000000000000000000001",
                            },
                            unjailed: false,
                            initial_wei: 1,
                        },
                    }),
                ApiRequestError,
                "Validator has delegations disabled",
            ),
            assertRejects(
                () => client.cValidatorAction({ unregister: null }),
                ApiRequestError,
                "Action disabled on this chain",
            ),
        ]);
    },
);

export type MethodReturnType_cWithdraw = Awaited<ReturnType<ExchangeClient["cWithdraw"]>>;
run(
    "cWithdraw",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.cWithdraw({ wei: 1 });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_evmUserModify = Awaited<ReturnType<ExchangeClient["evmUserModify"]>>;
run(
    "evmUserModify",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.all([
            // Check argument 'usingBigBlocks'
            client.evmUserModify({ usingBigBlocks: true }),
            client.evmUserModify({ usingBigBlocks: false }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_modify = Awaited<ReturnType<ExchangeClient["modify"]>>;
run(
    "modify",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        async function openOrder(
            client: ExchangeClient,
            id: number,
            pxDown: string,
            sz: string,
        ): Promise<{ oid: number; cloid: Hex }> {
            const cloid = randomCloid();
            const orderResp = await client.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: cloid,
                }],
                grouping: "na",
            });
            const [order] = orderResp.response.data.statuses;
            return {
                oid: "resting" in order ? order.resting.oid : order.filled.oid,
                cloid: "resting" in order ? order.resting.cloid! : order.filled.cloid!,
            };
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        try {
            const data = await Promise.all([
                // Check response 'success'
                client.modify({
                    oid: (await openOrder(client, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                }),
                // Check argument `oid` as cloid
                client.modify({
                    oid: (await openOrder(client, id, pxDown, sz)).cloid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                }),
                // Check argument 'expiresAfter'
                client.modify({
                    oid: (await openOrder(client, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                    expiresAfter: Date.now() + 1000 * 60 * 60,
                }),
                // Check argument 't.trigger'
                client.modify({
                    oid: (await openOrder(client, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: {
                            trigger: {
                                isMarket: false,
                                tpsl: "tp",
                                triggerPx: pxDown,
                            },
                        },
                    },
                }),
            ]);
            schemaCoverage(types, data);
        } finally {
            // —————————— Cleanup ——————————

            const openOrders = await infoClient.openOrders({
                user: mode === "normal" ? privateKeyToAddress(exchClient.wallet) : multiSignClient.multiSignAddress,
            });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await client.cancel({ cancels });
        }
    },
    { asset: "BTC" },
);

export type MethodReturnType_multiSig = Awaited<ReturnType<ExchangeClient["multiSig"]>>;
run(
    "multiSig",
    async (_types, _mode, _args, t) => {
        await t.step("L1 Action", async (t) => {
            await t.step("with 1 signer", async () => {
                // —————————— Prepare ——————————

                const signer1 = privateKeyToAccount(exchClient.wallet);

                // Preparing a temporary wallet
                const multiSigUser = new ExchangeClient({
                    wallet: privateKeyToAccount(generatePrivateKey()),
                    transport,
                    isTestnet: true,
                });

                await exchClient.usdSend({ destination: multiSigUser.wallet.address, amount: "2" });
                await multiSigUser.convertToMultiSigUser({
                    authorizedUsers: [signer1.address],
                    threshold: 1,
                });

                // Action
                const nonce = Date.now();
                const action = {
                    type: "scheduleCancel",
                    time: Date.now() + 10_000,
                } as const;

                // Signatures
                const signature1 = await signL1Action({
                    wallet: signer1,
                    action: [
                        multiSigUser.wallet.address.toLowerCase(),
                        signer1.address.toLowerCase(),
                        actionSorter[action.type](action),
                    ],
                    nonce,
                    isTestnet: true,
                });

                // —————————— Test ——————————

                await assertRejects(
                    async () =>
                        await exchClient.multiSig({
                            signatures: [signature1],
                            payload: {
                                multiSigUser: multiSigUser.wallet.address,
                                outerSigner: signer1.address,
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

                const signer1 = privateKeyToAccount(exchClient.wallet);

                // Preparing a temporary wallet
                const multiSigUser = new ExchangeClient({
                    wallet: privateKeyToAccount(generatePrivateKey()),
                    transport,
                    isTestnet: true,
                });
                const signer2 = privateKeyToAccount(generatePrivateKey());

                await exchClient.usdSend({ destination: multiSigUser.wallet.address, amount: "2" });
                await exchClient.usdSend({ destination: signer2.address, amount: "2" });
                await multiSigUser.convertToMultiSigUser({
                    authorizedUsers: [signer1.address, signer2.address],
                    threshold: 2,
                });

                // Action
                const nonce = Date.now();
                const action = { type: "scheduleCancel", time: Date.now() + 10000 };

                // Signatures
                const signature1 = await signL1Action({
                    wallet: signer1,
                    action: [
                        multiSigUser.wallet.address.toLowerCase(),
                        signer1.address.toLowerCase(),
                        action,
                    ],
                    nonce,
                    isTestnet: true,
                });
                const signature2 = await signL1Action({
                    wallet: signer2,
                    action: [
                        multiSigUser.wallet.address.toLowerCase(),
                        signer1.address.toLowerCase(),
                        action,
                    ],
                    nonce,
                    isTestnet: true,
                });

                // —————————— Test ——————————

                await assertRejects(
                    async () =>
                        await exchClient.multiSig({
                            signatures: [signature1, signature2],
                            payload: {
                                multiSigUser: multiSigUser.wallet.address,
                                outerSigner: signer1.address,
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

                const signer1 = privateKeyToAccount(exchClient.wallet);

                // Preparing a temporary wallet
                const multiSigUser = new ExchangeClient({
                    wallet: privateKeyToAccount(generatePrivateKey()),
                    transport,
                    isTestnet: true,
                });

                await exchClient.usdSend({ destination: multiSigUser.wallet.address, amount: "2" });
                await multiSigUser.convertToMultiSigUser({
                    authorizedUsers: [signer1.address],
                    threshold: 1,
                });

                // Action
                const nonce = Date.now();
                const action = {
                    type: "usdSend",
                    signatureChainId: "0x66eee",
                    hyperliquidChain: "Testnet",
                    destination: "0x0000000000000000000000000000000000000001",
                    amount: "100",
                    time: nonce,
                } as const;

                // Signatures
                const signature1 = await signUserSignedAction({
                    wallet: signer1,
                    action: {
                        ...action,
                        payloadMultiSigUser: multiSigUser.wallet.address,
                        outerSigner: signer1.address,
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
                });

                // —————————— Test ——————————

                await assertRejects(
                    async () =>
                        await exchClient.multiSig({
                            signatures: [signature1],
                            payload: {
                                multiSigUser: multiSigUser.wallet.address,
                                outerSigner: signer1.address,
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

                const signer1 = privateKeyToAccount(exchClient.wallet);

                // Preparing a temporary wallet
                const multiSigUser = new ExchangeClient({
                    wallet: privateKeyToAccount(generatePrivateKey()),
                    transport,
                    isTestnet: true,
                });
                const signer2 = privateKeyToAccount(generatePrivateKey());

                await exchClient.usdSend({ destination: multiSigUser.wallet.address, amount: "2" });
                await exchClient.usdSend({ destination: signer2.address, amount: "2" });

                await multiSigUser.convertToMultiSigUser({
                    authorizedUsers: [signer1.address, signer2.address],
                    threshold: 2,
                });

                // Action
                const nonce = Date.now();
                const action = {
                    type: "usdSend",
                    signatureChainId: "0x66eee",
                    hyperliquidChain: "Testnet",
                    destination: "0x0000000000000000000000000000000000000001",
                    amount: "100",
                    time: nonce,
                } as const;

                // Signatures
                const signature1 = await signUserSignedAction({
                    wallet: signer1,
                    action: {
                        ...action,
                        payloadMultiSigUser: multiSigUser.wallet.address,
                        outerSigner: signer1.address,
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
                });
                const signature2 = await signUserSignedAction({
                    wallet: signer2,
                    action: {
                        ...action,
                        payloadMultiSigUser: multiSigUser.wallet.address,
                        outerSigner: signer1.address,
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
                });

                // —————————— Test ——————————

                await assertRejects(
                    async () =>
                        await exchClient.multiSig({
                            signatures: [signature1, signature2],
                            payload: {
                                multiSigUser: multiSigUser.wallet.address,
                                outerSigner: signer1.address,
                                action,
                            },
                            nonce,
                        }),
                    ApiRequestError,
                    "Insufficient balance for withdrawal",
                );
            });
        });
    },
);

export type MethodReturnType_order = Awaited<ReturnType<ExchangeClient["order"]>>;
run(
    "order",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        try {
            const data = await Promise.allSettled([
                // Check response 'resting' + argument 'expiresAfter'
                client.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                    expiresAfter: Date.now() + 1000 * 60 * 60,
                }),
                // Check response 'resting' + `cloid`
                client.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    }],
                    grouping: "na",
                }),
                // Check response 'filled'
                client.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                }),
                // Check response 'filled' + `cloid`
                client.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    }],
                    grouping: "na",
                }),
                // Check argument 'builder'
                client.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                    builder: {
                        b: "0x0000000000000000000000000000000000000001",
                        f: 1,
                    },
                }),
                // Check argument 't.trigger'
                client.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: {
                            trigger: {
                                isMarket: true,
                                triggerPx: pxDown,
                                tpsl: "tp",
                            },
                        },
                    }],
                    grouping: "na",
                }),
            ]);
            if (data.some((d) => d.status === "rejected")) {
                data
                    .filter((p) => p.status === "rejected")
                    .forEach((p) => {
                        assertIsError(p.reason, ApiRequestError, "Builder fee has not been approved");
                    });
            } else {
                const d = data.filter((p) => p.status === "fulfilled").map((p) => p.value);
                schemaCoverage(types, d);
            }
        } finally {
            // —————————— Cleanup ——————————

            const openOrders = await infoClient.openOrders({
                user: mode === "normal" ? privateKeyToAddress(exchClient.wallet) : multiSignClient.multiSignAddress,
            });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await client.cancel({ cancels });

            await client.order({
                orders: [{
                    a: id,
                    b: false,
                    p: pxDown,
                    s: "0", // Full position size
                    r: true,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            });
        }
    },
    { asset: "BTC" },
);

export type MethodReturnType_perpDeploy = Awaited<ReturnType<ExchangeClient["perpDeploy"]>>;
run(
    "perpDeploy",
    async (_types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await Promise.all([
            // Register Asset | maxGas
            assertRejects( // exists
                () =>
                    client.perpDeploy({
                        registerAsset: {
                            maxGas: 1000000000000,
                            assetRequest: {
                                coin: "1",
                                szDecimals: 1,
                                oraclePx: "1",
                                marginTableId: 1,
                                onlyIsolated: true,
                            },
                            dex: "test",
                        },
                    }),
                ApiRequestError,
                "Error deploying perp:",
            ),
            assertRejects( // does not exist
                () =>
                    client.perpDeploy({
                        registerAsset: {
                            assetRequest: {
                                coin: "1",
                                szDecimals: 1,
                                oraclePx: "1",
                                marginTableId: 1,
                                onlyIsolated: true,
                            },
                            dex: "test",
                        },
                    }),
                ApiRequestError,
                "Error deploying perp:",
            ),
            // Set Oracle
            assertRejects(
                () =>
                    client.perpDeploy({
                        setOracle: {
                            dex: "test",
                            oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
                            markPxs: [["TEST0", "3.0"], ["TEST1", "14"]],
                        },
                    }),
                ApiRequestError,
                "Error deploying perp:",
            ),
        ]);
    },
);

export type MethodReturnType_perpDexClassTransfer = Awaited<ReturnType<ExchangeClient["perpDexClassTransfer"]>>;
run(
    "perpDexClassTransfer",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.all([
            client.perpDexClassTransfer({ dex: "test", token: "USDC", amount: "1", toPerp: true }),
            client.perpDexClassTransfer({ dex: "test", token: "USDC", amount: "1", toPerp: false }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_perpDexTransfer = Awaited<ReturnType<ExchangeClient["perpDexTransfer"]>>;
run(
    "perpDexTransfer",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.all([
            client.perpDexTransfer({ sourceDex: "", destinationDex: "test", amount: "1" }),
            client.perpDexTransfer({ sourceDex: "test", destinationDex: "", amount: "1" }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_registerReferrer = Awaited<ReturnType<ExchangeClient["registerReferrer"]>>;
run(
    "registerReferrer",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await client.registerReferrer({ code: "TEST" })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch(async (e) => {
                if (e instanceof SchemaCoverageError) throw e;
                await Promise.any([
                    () => assertIsError(e, ApiRequestError, "Referral code already registered for this user"),
                    () => assertIsError(e, ApiRequestError, "Cannot generate referral code until enough volume traded"),
                ]);
            });
    },
);

export type MethodReturnType_reserveRequestWeight = Awaited<ReturnType<ExchangeClient["reserveRequestWeight"]>>;
run(
    "reserveRequestWeight",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.all([
            // Check response 'success'
            client.reserveRequestWeight({ weight: 1 }),
            // Check argument 'expiresAfter'
            client.reserveRequestWeight({ weight: 1, expiresAfter: Date.now() + 1000 * 60 * 60 }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_scheduleCancel = Awaited<ReturnType<ExchangeClient["scheduleCancel"]>>;
run(
    "scheduleCancel",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.allSettled([
            // Check argument 'time' + argument 'expiresAfter'
            client.scheduleCancel({ time: Date.now() + 10000 }),
            client.scheduleCancel({ expiresAfter: Date.now() + 1000 * 60 * 60 }),
        ]);
        if (data.some((d) => d.status === "rejected")) {
            data
                .filter((p) => p.status === "rejected")
                .forEach((p) => {
                    assertIsError(
                        p.reason,
                        ApiRequestError,
                        "Cannot set scheduled cancel time until enough volume traded",
                    );
                });
        } else {
            const d = data.filter((p) => p.status === "fulfilled").map((p) => p.value);
            schemaCoverage(types, d);
        }
    },
);

export type MethodReturnType_setDisplayName = Awaited<ReturnType<ExchangeClient["setDisplayName"]>>;
run(
    "setDisplayName",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.setDisplayName({ displayName: "" });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_setReferrer = Awaited<ReturnType<ExchangeClient["setReferrer"]>>;
run(
    "setReferrer",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await client.setReferrer({ code: "TEST" })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch(async (e) => {
                if (e instanceof SchemaCoverageError) throw e;
                await Promise.all([
                    () => assertIsError(e, ApiRequestError, "Cannot self-refer"),
                    () => assertIsError(e, ApiRequestError, "Referrer already set"),
                ]);
            });
    },
);

export type MethodReturnType_spotDeploy = Awaited<ReturnType<ExchangeClient["spotDeploy"]>>;
run(
    "spotDeploy",
    async (_types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await Promise.all([
            // Register Token | fullName
            assertRejects( // exists
                () =>
                    client.spotDeploy({
                        registerToken2: {
                            spec: {
                                name: "TestToken",
                                szDecimals: 8,
                                weiDecimals: 8,
                            },
                            maxGas: 1000000,
                            fullName: "TestToken (TT)",
                        },
                    }),
                ApiRequestError,
            ),
            assertRejects( // does not exist
                () =>
                    client.spotDeploy({
                        registerToken2: {
                            spec: {
                                name: "TestToken",
                                szDecimals: 8,
                                weiDecimals: 8,
                            },
                            maxGas: 1000000,
                        },
                    }),
                ApiRequestError,
            ),
            // User Genesis | blacklistUsers
            assertRejects( // exists
                () =>
                    client.spotDeploy({
                        userGenesis: {
                            token: 0,
                            userAndWei: [],
                            existingTokenAndWei: [],
                            blacklistUsers: [],
                        },
                    }),
                ApiRequestError,
                "Genesis error:",
            ),
            assertRejects( // does not exist
                () =>
                    client.spotDeploy({
                        userGenesis: {
                            token: 0,
                            userAndWei: [],
                            existingTokenAndWei: [],
                        },
                    }),
                ApiRequestError,
                "Genesis error:",
            ),
            // Genesis | noHyperliquidity
            assertRejects( // exists
                () =>
                    client.spotDeploy({
                        genesis: {
                            token: 0,
                            maxSupply: "10000000000",
                            noHyperliquidity: true,
                        },
                    }),
                ApiRequestError,
                "Genesis error:",
            ),
            assertRejects( // does not exist
                () =>
                    client.spotDeploy({
                        genesis: {
                            token: 0,
                            maxSupply: "10000000000",
                        },
                    }),
                ApiRequestError,
                "Genesis error:",
            ),
            // Register Spot
            assertRejects(
                () =>
                    client.spotDeploy({
                        registerSpot: {
                            tokens: [0, 0],
                        },
                    }),
                ApiRequestError,
                "Error deploying spot:",
            ),
            // Register Hyperliquidity | nSeededLevels
            assertRejects( // exists
                () =>
                    client.spotDeploy({
                        registerHyperliquidity: {
                            spot: 0,
                            startPx: "1",
                            orderSz: "1",
                            nOrders: 1,
                            nSeededLevels: 1,
                        },
                    }),
                ApiRequestError,
                "Error deploying spot:",
            ),
            assertRejects( // does not exist
                () =>
                    client.spotDeploy({
                        registerHyperliquidity: {
                            spot: 0,
                            startPx: "1",
                            orderSz: "1",
                            nOrders: 1,
                        },
                    }),
                ApiRequestError,
                "Error deploying spot:",
            ),
            // Set Deployer Trading Fee Share
            assertRejects(
                () =>
                    client.spotDeploy({
                        setDeployerTradingFeeShare: {
                            token: 0,
                            share: "0%",
                        },
                    }),
                ApiRequestError,
                "Error deploying spot:",
            ),
        ]);
    },
);

export type MethodReturnType_spotSend = Awaited<ReturnType<ExchangeClient["spotSend"]>>;
run(
    "spotSend",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.spotSend({
            destination: "0x0000000000000000000000000000000000000001",
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "1",
        });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_spotUser = Awaited<ReturnType<ExchangeClient["spotUser"]>>;
run(
    "spotUser",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data1 = await client.spotUser({ toggleSpotDusting: { optOut: true } });
        const data2 = await client.spotUser({ toggleSpotDusting: { optOut: false } });
        schemaCoverage(types, [data1, data2]);
    },
);

export type MethodReturnType_subAccountSpotTransfer = Awaited<ReturnType<ExchangeClient["subAccountSpotTransfer"]>>;
run(
    "subAccountSpotTransfer",
    async (types, mode, { subAccountUser }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.allSettled([
            // Check argument 'isDeposit'
            client.subAccountSpotTransfer({
                subAccountUser,
                isDeposit: true,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1",
            }),
            client.subAccountSpotTransfer({
                subAccountUser,
                isDeposit: false,
                token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
                amount: "1",
            }),
        ]);
        if (data.some((d) => d.status === "rejected")) {
            data
                .filter((p) => p.status === "rejected")
                .forEach((p) => {
                    assertIsError(p.reason, ApiRequestError, "Invalid sub-account transfer");
                });
        } else {
            const d = data.filter((p) => p.status === "fulfilled").map((p) => p.value);
            schemaCoverage(types, d);
        }
    },
    { subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1" } as const,
);

export type MethodReturnType_subAccountTransfer = Awaited<ReturnType<ExchangeClient["subAccountTransfer"]>>;
run(
    "subAccountTransfer",
    async (types, mode, { subAccountUser }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.allSettled([
            // Check argument 'isDeposit'
            client.subAccountTransfer({ subAccountUser, isDeposit: true, usd: 1 }),
            client.subAccountTransfer({ subAccountUser, isDeposit: false, usd: 1 }),
        ]);
        if (data.some((d) => d.status === "rejected")) {
            data
                .filter((p) => p.status === "rejected")
                .forEach((p) => {
                    assertIsError(p.reason, ApiRequestError, "Invalid sub-account transfer from");
                });
        } else {
            const d = data.filter((p) => p.status === "fulfilled").map((p) => p.value);
            schemaCoverage(types, d);
        }
    },
    { subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1" } as const,
);

export type MethodReturnType_tokenDelegate = Awaited<ReturnType<ExchangeClient["tokenDelegate"]>>;
run(
    "tokenDelegate",
    async (types, mode, { validator }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data1 = await client.tokenDelegate({ validator, wei: 1, isUndelegate: true });
        const data2 = await client.tokenDelegate({ validator, wei: 1, isUndelegate: false });
        schemaCoverage(types, [data1, data2]);
    },
    { validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596" } as const,
);

export type MethodReturnType_twapCancel = Awaited<ReturnType<ExchangeClient["twapCancel"]>>;
run(
    "twapCancel",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        async function createTWAP(client: ExchangeClient, id: number, sz: string): Promise<number> {
            const twapOrderResult = await client.twapOrder({
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            });
            const twapId = twapOrderResult.response.data.status.running.twapId;
            return twapId;
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await Promise.all([
            // Check response 'success'
            client.twapCancel({
                a: id,
                t: await createTWAP(client, id, sz),
            }),
            // Check argument 'expiresAfter'
            client.twapCancel({
                a: id,
                t: await createTWAP(client, id, sz),
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { asset: "BTC" },
);

export type MethodReturnType_twapOrder = Awaited<ReturnType<ExchangeClient["twapOrder"]>>;
run(
    "twapOrder",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await Promise.all([
            // Check response 'success'
            client.twapOrder({
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            }),
            // Check argument 'expiresAfter'
            client.twapOrder({
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);

        try {
            schemaCoverage(types, data, {
                ignoreBranchesByPath: {
                    "#/properties/response/properties/data/properties/status/anyOf": [1], // error
                },
            });
        } finally {
            // —————————— Cleanup ——————————

            await Promise.all(data.map((d) => {
                return client.twapCancel({ a: id, t: d.response.data.status.running.twapId });
            }));
        }
    },
    { asset: "BTC" },
);

export type MethodReturnType_updateIsolatedMargin = Awaited<ReturnType<ExchangeClient["updateIsolatedMargin"]>>;
run(
    "updateIsolatedMargin",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        //Preparing position
        await client.order({
            orders: [{
                a: id,
                b: false,
                p: pxDown,
                s: "0", // Full position size
                r: true,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        }).catch(() => undefined);
        await client.updateLeverage({ asset: id, isCross: false, leverage: 3 });
        await client.order({
            orders: [{
                a: id,
                b: true,
                p: pxUp,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        });

        // —————————— Test ——————————

        try {
            const data = await Promise.all([
                // Check argument 'isBuy' + argument 'expiresAfter'
                client.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 1 }),
                client.updateIsolatedMargin({
                    asset: id,
                    isBuy: false,
                    ntli: 1,
                    expiresAfter: Date.now() + 1000 * 60 * 60,
                }),
            ]);
            schemaCoverage(types, data);
        } finally {
            // —————————— Cleanup ——————————

            await client.order({
                orders: [{
                    a: id,
                    b: false,
                    p: pxDown,
                    s: "0", // Full position size
                    r: true,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            });
        }
    },
    { asset: "BTC" },
);

export type MethodReturnType_updateLeverage = Awaited<ReturnType<ExchangeClient["updateLeverage"]>>;
run(
    "updateLeverage",
    async (types, mode, { asset }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);

        await client.order({
            orders: [{
                a: id,
                b: false,
                p: pxDown,
                s: "0", // Full position size
                r: true,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        }).catch(() => undefined);

        // —————————— Test ——————————

        const data = await Promise.all([
            // Check argument 'isCross' + argument 'expiresAfter'
            client.updateLeverage({ asset: id, isCross: true, leverage: 1 }),
            client.updateLeverage({
                asset: id,
                isCross: false,
                leverage: 1,
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { asset: "BTC" },
);

export type MethodReturnType_usdClassTransfer = Awaited<ReturnType<ExchangeClient["usdClassTransfer"]>>;
run(
    "usdClassTransfer",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.all([
            // Check argument 'toPerp'
            client.usdClassTransfer({ amount: "1", toPerp: false }),
            client.usdClassTransfer({ amount: "1", toPerp: true }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_usdSend = Awaited<ReturnType<ExchangeClient["usdSend"]>>;
run(
    "usdSend",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.usdSend({ destination: "0x0000000000000000000000000000000000000001", amount: "1" });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_vaultDistribute = Awaited<ReturnType<ExchangeClient["vaultDistribute"]>>;
run(
    "vaultDistribute",
    async (types, mode, { vaultAddress }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        await client.vaultDistribute({ vaultAddress, usd: 10 * 1e6 })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Only leader can perform this vault action");
            });
    },
    { vaultAddress: "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f" } as const,
);

export type MethodReturnType_vaultModify = Awaited<ReturnType<ExchangeClient["vaultModify"]>>;
run(
    "vaultModify",
    async (types, mode, { vaultAddress }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.allSettled([
            // Check without arguments
            client.vaultModify({
                vaultAddress,
                allowDeposits: null,
                alwaysCloseOnWithdraw: null,
            }),
            // Check argument 'allowDeposits'
            client.vaultModify({
                vaultAddress,
                allowDeposits: true,
                alwaysCloseOnWithdraw: null,
            }),
            client.vaultModify({
                vaultAddress,
                allowDeposits: false,
                alwaysCloseOnWithdraw: null,
            }),
            // Check argument 'alwaysCloseOnWithdraw'
            client.vaultModify({
                vaultAddress,
                allowDeposits: null,
                alwaysCloseOnWithdraw: true,
            }),
            client.vaultModify({
                vaultAddress,
                allowDeposits: null,
                alwaysCloseOnWithdraw: false,
            }),
        ]);
        if (data.some((d) => d.status === "rejected")) {
            data
                .filter((p) => p.status === "rejected")
                .forEach((p) => {
                    assertIsError(p.reason, ApiRequestError, "Only leader can perform this vault action");
                });
        } else {
            const d = data.filter((p) => p.status === "fulfilled").map((p) => p.value);
            schemaCoverage(types, d);
        }
    },
    { vaultAddress: "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f" } as const,
);

export type MethodReturnType_vaultTransfer = Awaited<ReturnType<ExchangeClient["vaultTransfer"]>>;
run(
    "vaultTransfer",
    async (types, mode, { vaultAddress }) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await Promise.allSettled([
            client.vaultTransfer({
                vaultAddress,
                isDeposit: false,
                usd: 5 * 1e6,
            }),
            client.vaultTransfer({
                vaultAddress,
                isDeposit: true,
                usd: 5 * 1e6,
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);
        if (data.some((d) => d.status === "rejected")) {
            data
                .filter((p) => p.status === "rejected")
                .forEach(async (p) => {
                    await Promise.all([
                        () => assertIsError(p.reason, ApiRequestError, "This vault does not accept deposits"),
                        () => assertIsError(p.reason, ApiRequestError, "Insufficient vault equity for withdrawal"),
                    ]);
                });
        } else {
            const d = data.filter((p) => p.status === "fulfilled").map((p) => p.value);
            schemaCoverage(types, d);
        }
    },
    { vaultAddress: "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f" } as const,
);

export type MethodReturnType_withdraw3 = Awaited<ReturnType<ExchangeClient["withdraw3"]>>;
run(
    "withdraw3",
    async (types, mode) => {
        const client = mode === "normal" ? exchClient : multiSignClient;

        const data = await client.withdraw3({
            amount: "2",
            destination: privateKeyToAddress(client.wallet),
        });
        schemaCoverage(types, [data]);
    },
);

Deno.test("_guessSignatureChainId", async (t) => {
    await t.step({
        name: "viem",
        fn: async () => {
            const wallet = createWalletClient({
                account: privateKeyToAccount(generatePrivateKey()),
                transport: http("https://ethereum-rpc.publicnode.com"),
                chain: mainnet,
            });
            const exchClient = new ExchangeClient({ wallet, transport: new HttpTransport() });

            const signatureChainId = typeof exchClient.signatureChainId === "string"
                ? exchClient.signatureChainId
                : await exchClient.signatureChainId();
            assertEquals(signatureChainId, "0x1");
        },
        ignore: !METHODS_TO_TEST.includes("_guessSignatureChainId"),
    });

    await t.step({
        name: "viem",
        fn: async () => {},
        ignore: !METHODS_TO_TEST.includes("_guessSignatureChainId"),
    });

    await t.step({
        name: "ethers",
        fn: async () => {
            const provider = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com");
            const wallet = new ethers.Wallet(generatePrivateKey(), provider);

            const exchClient = new ExchangeClient({ wallet, transport: new HttpTransport() });

            const signatureChainId = typeof exchClient.signatureChainId === "string"
                ? exchClient.signatureChainId
                : await exchClient.signatureChainId();
            assertEquals(signatureChainId, "0x1");
        },
        ignore: !METHODS_TO_TEST.includes("_guessSignatureChainId"),
    });

    await t.step({
        name: "window.ethereum",
        fn: async () => {
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
        },
        ignore: !METHODS_TO_TEST.includes("_guessSignatureChainId"),
    });

    await t.step({
        name: "default",
        fn: async (t) => {
            await t.step("mainnet", async () => {
                const transport = new HttpTransport();
                const exchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport });

                const signatureChainId = typeof exchClient.signatureChainId === "string"
                    ? exchClient.signatureChainId
                    : await exchClient.signatureChainId();
                assertEquals(signatureChainId, "0xa4b1");
            });

            await t.step("testnet", async () => {
                const transport = new HttpTransport();
                const exchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport, isTestnet: true });

                const signatureChainId = typeof exchClient.signatureChainId === "string"
                    ? exchClient.signatureChainId
                    : await exchClient.signatureChainId();
                assertEquals(signatureChainId, "0x66eee");
            });
        },
        ignore: !METHODS_TO_TEST.includes("_guessSignatureChainId"),
    });
});

Deno.test("_validateResponse", { ignore: !PRIVATE_KEY }, async (t) => {
    await t.step({
        name: "CancelResponse",
        fn: async () => {
            await assertRejects(
                () => exchClient.cancel({ cancels: [{ a: 0, o: 0 }] }),
                ApiRequestError,
                "Order 0: Order was never placed, already canceled, or filled. asset=0",
            );
        },
        ignore: !METHODS_TO_TEST.includes("_validateResponse"),
    });

    await t.step({
        name: "ErrorResponse",
        fn: async () => {
            await assertRejects(
                () => exchClient.scheduleCancel({ time: 1 }),
                ApiRequestError,
                "Scheduled cancel time too early, must be at least 5 seconds from now.",
            );
        },
        ignore: !METHODS_TO_TEST.includes("_validateResponse"),
    });

    await t.step({
        name: "OrderResponse",
        fn: async () => {
            await assertRejects(
                () =>
                    exchClient.order({
                        orders: [{ a: 0, b: true, p: "0", s: "0", r: false, t: { limit: { tif: "Gtc" } } }],
                        grouping: "na",
                    }),
                ApiRequestError,
                "Order 0: Order has zero size.",
            );
        },
        ignore: !METHODS_TO_TEST.includes("_validateResponse"),
    });

    await t.step({
        name: "TwapCancelResponse",
        fn: async () => {
            await assertRejects(
                () => exchClient.twapOrder({ a: 0, b: true, s: "0", r: false, m: 5, t: false }),
                ApiRequestError,
                "Order has zero size.",
            );
        },
        ignore: !METHODS_TO_TEST.includes("_validateResponse"),
    });

    await t.step({
        name: "TwapOrderResponse",
        fn: async () => {
            await assertRejects(
                () => exchClient.twapOrder({ a: 0, b: true, s: "0", r: false, m: 5, t: false }),
                ApiRequestError,
                "Order has zero size.",
            );
        },
        ignore: !METHODS_TO_TEST.includes("_validateResponse"),
    });
});
