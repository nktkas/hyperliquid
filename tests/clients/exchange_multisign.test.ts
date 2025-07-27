import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { assertEquals, assertIsError, assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, ExchangeClient, HttpTransport, InfoClient, MultiSignClient } from "../../mod.ts";
import { signL1Action, signUserSignedAction, userSignedActionEip712Types } from "../../src/signing/mod.ts";
import { schemaCoverage, SchemaCoverageError, schemaGenerator } from "../_utils/schema/mod.ts";
import { anyFnSuccess, formatPrice, formatSize, getAssetData, randomCloid } from "../_utils/utils.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 1000 }, string: ["_"] }) as Args<{
    /** Delay to avoid rate limits */
    wait: number;
}>;

const PRIVATE_KEY = cliArgs._[0] as `0x${string}`; // must be sole signer for a multi-sign account
const VAULT_ADDRESS = "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b"; // replace with your vault address
const SUB_ACCOUNT_ADDRESS = "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1"; // replace with your sub-account address
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
    "registerReferrer",
    "reserveRequestWeight",
    "scheduleCancel",
    "setDisplayName",
    "setReferrer",
    "spotDeploy",
    "spotSend",
    "subAccountModify",
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

function run<Args extends Record<string, unknown>>(
    name: string,
    fn: (
        types: Record<string, unknown>,
        exchange: {
            client: ExchangeClient | MultiSignClient;
            address: `0x${string}`;
        },
        args: Args,
        t: Deno.TestContext,
    ) => Promise<void>,
    args: Args = {} as Args,
) {
    Deno.test(
        name,
        { ignore: !METHODS_TO_TEST.includes(name) || !PRIVATE_KEY },
        async (t) => {
            const MethodReturnType = schemaGenerator(import.meta.url, `MethodReturnType_${name}`);
            for (const mode of ["normal", "multisign"] as const) {
                await t.step({
                    name: mode,
                    ignore: mode === "multisign" && SKIP_METHODS_FOR_MULTISIGN.includes(name),
                    fn: async (t) => {
                        await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits
                        await fn(
                            MethodReturnType,
                            {
                                client: mode === "normal" ? exchClient : multiSignClient,
                                address: mode === "normal"
                                    ? privateKeyToAddress(exchClient.wallet)
                                    : multiSignClient.multiSignAddress,
                            },
                            args,
                            t,
                        );
                    },
                });
            }
        },
    );
}

export type MethodReturnType_approveAgent = Awaited<ReturnType<ExchangeClient["approveAgent"]>>;
run(
    "approveAgent",
    async (types, { client }, _, t) => {
        await t.step("with 'agentName'", async () => {
            const data = await client.approveAgent({
                agentAddress: privateKeyToAddress(generatePrivateKey()),
                agentName: "agentName",
            });
            schemaCoverage(types, [data]);
        });

        await new Promise((r) => setTimeout(r, 5000)); // waiting to avoid error `ApiRequestError: User has pending agent removal`

        await t.step("without 'agentName'", async () => {
            const data = await client.approveAgent({
                agentAddress: privateKeyToAddress(generatePrivateKey()),
                agentName: null,
            });
            schemaCoverage(types, [data]);
        });
    },
);

export type MethodReturnType_approveBuilderFee = Awaited<ReturnType<ExchangeClient["approveBuilderFee"]>>;
run(
    "approveBuilderFee",
    async (types, { client }, { builder }) => {
        const data = await client.approveBuilderFee({ maxFeeRate: "0.001%", builder });
        schemaCoverage(types, [data]);
    },
    { builder: "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83" } as const,
);

export type MethodReturnType_batchModify = Awaited<ReturnType<ExchangeClient["batchModify"]>>;
run(
    "batchModify",
    async (types, { client, address }, { asset }) => {
        // —————————— Prepare ——————————

        async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string) {
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
                // resting
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
                }),
                // resting | cloid
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
                            c: randomCloid(),
                        },
                    }],
                }),
                // filled
                client.batchModify({
                    modifies: [{
                        oid: (await openOrder(client, id, pxDown, sz)).cloid,
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
                // filled | cloid
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
            ]);
            schemaCoverage(types, data);
        } finally {
            // —————————— Cleanup ——————————

            const openOrders = await infoClient.openOrders({ user: address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await client.cancel({ cancels });
            await client.order({
                orders: [{
                    a: id,
                    b: false,
                    p: pxDown,
                    s: "0", // full position size
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
    async (types, { client }, { asset }) => {
        // —————————— Prepare ——————————

        async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string) {
            await client.updateLeverage({
                asset: id,
                isCross: true,
                leverage: 3,
            });
            const openOrderRes = await client.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            });
            const [order] = openOrderRes.response.data.statuses;
            return "resting" in order ? order.resting.oid : order.filled.oid;
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await client.cancel({
            cancels: [{
                a: id,
                o: await openOrder(client, id, pxDown, sz),
            }],
        });
        schemaCoverage(types, [data]);
    },
    { asset: "BTC" },
);

export type MethodReturnType_cancelByCloid = Awaited<ReturnType<ExchangeClient["cancelByCloid"]>>;
run(
    "cancelByCloid",
    async (types, { client }, { asset }) => {
        // —————————— Prepare ——————————

        async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string) {
            await client.updateLeverage({
                asset: id,
                isCross: true,
                leverage: 3,
            });
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

        const data = await client.cancelByCloid({
            cancels: [{
                asset: id,
                cloid: await openOrder(client, id, pxDown, sz),
            }],
        });
        schemaCoverage(types, [data]);
    },
    { asset: "BTC" },
);

export type MethodReturnType_cDeposit = Awaited<ReturnType<ExchangeClient["cDeposit"]>>;
run(
    "cDeposit",
    async (types, { client }) => {
        const data = await client.cDeposit({ wei: 1 });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_claimRewards = Awaited<ReturnType<ExchangeClient["claimRewards"]>>;
run(
    "claimRewards",
    async (types, { client }) => {
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
    async (types, { client, address }, _, t) => {
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

        await t.step("to multi-sign", async () => {
            const data = await tempExchClient.convertToMultiSigUser({
                signers: {
                    authorizedUsers: [address],
                    threshold: 1,
                },
            });
            schemaCoverage(types, [data]);
        });

        await t.step("to single-sign", async () => {
            const data = await tempMultiSignClient.convertToMultiSigUser({ signers: null });
            schemaCoverage(types, [data]);
        });
    },
);

export type MethodReturnType_createSubAccount = Awaited<ReturnType<ExchangeClient["createSubAccount"]>>;
run(
    "createSubAccount",
    async (types, { client }) => {
        await client.createSubAccount({ name: String(Date.now()) })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                anyFnSuccess([
                    () => assertIsError(e, ApiRequestError, "Too many sub-accounts"),
                    () => assertIsError(e, ApiRequestError, "Cannot create sub-accounts until enough volume traded"),
                ]);
            });
    },
);

export type MethodReturnType_createVault = Awaited<ReturnType<ExchangeClient["createVault"]>>;
run(
    "createVault",
    async (types, { client }) => {
        await client.createVault({
            name: "test",
            description: "1234567890",
            initialUsd: Number.MAX_SAFE_INTEGER,
            nonce: Date.now(),
        })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Insufficient balance to create vault");
            });
    },
);

export type MethodReturnType_cSignerAction = Awaited<ReturnType<ExchangeClient["cSignerAction"]>>;
run(
    "cSignerAction",
    async (_types, { client }, _, t) => {
        await t.step("jailSelf", async () => {
            await assertRejects(
                () => client.cSignerAction({ jailSelf: null }),
                ApiRequestError,
                "Signer invalid or inactive for current epoch",
            );
        });

        await t.step("unjailSelf", async () => {
            await assertRejects(
                () => client.cSignerAction({ unjailSelf: null }),
                ApiRequestError,
                "Signer invalid or inactive for current epoch",
            );
        });
    },
);

export type MethodReturnType_cValidatorAction = Awaited<ReturnType<ExchangeClient["cValidatorAction"]>>;
run(
    "cValidatorAction",
    async (_types, { client }, _, t) => {
        await t.step("changeProfile", async () => {
            await assertRejects(
                () =>
                    client.cValidatorAction({
                        changeProfile: {
                            node_ip: { Ip: "1.2.3.4" },
                            name: "...",
                            description: "...",
                            unjailed: false,
                            disable_delegations: false,
                            commission_bps: null,
                            signer: null,
                        },
                    }),
                ApiRequestError,
                "Unknown validator",
            );
        });

        await t.step("register", async () => {
            await assertRejects(
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
            );
        });

        await t.step("unregister", async () => {
            await assertRejects(
                () => client.cValidatorAction({ unregister: null }),
                ApiRequestError,
                "Action disabled on this chain",
            );
        });
    },
);

export type MethodReturnType_cWithdraw = Awaited<ReturnType<ExchangeClient["cWithdraw"]>>;
run(
    "cWithdraw",
    async (types, { client }) => {
        const data = await client.cWithdraw({ wei: 1 });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_evmUserModify = Awaited<ReturnType<ExchangeClient["evmUserModify"]>>;
run(
    "evmUserModify",
    async (types, { client }) => {
        const data = await client.evmUserModify({ usingBigBlocks: true });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_modify = Awaited<ReturnType<ExchangeClient["modify"]>>;
run(
    "modify",
    async (types, { client, address }, { asset }) => {
        // —————————— Prepare ——————————

        async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string) {
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
            const data = await client.modify({
                oid: (await openOrder(client, id, pxDown, sz)).oid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
            });
            schemaCoverage(types, [data]);
        } finally {
            // —————————— Cleanup ——————————

            const openOrders = await infoClient.openOrders({ user: address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await client.cancel({ cancels });
        }
    },
    { asset: "BTC" },
);

export type MethodReturnType_multiSig = Awaited<ReturnType<ExchangeClient["multiSig"]>>;
run(
    "multiSig",
    async (_types, _client, _args, t) => {
        await t.step("L1 Action", async () => {
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
                signers: {
                    authorizedUsers: [signer1.address, signer2.address],
                    threshold: 2,
                },
            });

            // Action
            const nonce = Date.now();
            const action = {
                type: "scheduleCancel",
                time: Date.now() + 10000,
            } as const;

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

        await t.step("User Signed Action", async () => {
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
                signers: {
                    authorizedUsers: [signer1.address, signer2.address],
                    threshold: 2,
                },
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
                types: userSignedActionEip712Types[action.type],
            });
            const signature2 = await signUserSignedAction({
                wallet: signer2,
                action: {
                    ...action,
                    payloadMultiSigUser: multiSigUser.wallet.address,
                    outerSigner: signer1.address,
                },
                types: userSignedActionEip712Types[action.type],
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
    },
);

export type MethodReturnType_order = Awaited<ReturnType<ExchangeClient["order"]>>;
run(
    "order",
    async (types, { client, address }, { asset }) => {
        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        try {
            const data = await Promise.all([
                // resting
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
                }),
                // resting | cloid
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
                // filled
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
                // filled | cloid
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
            ]);
            schemaCoverage(types, data);
        } finally {
            // —————————— Cleanup ——————————

            const openOrders = await infoClient.openOrders({ user: address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await client.cancel({ cancels });
            await client.order({
                orders: [{
                    a: id,
                    b: false,
                    p: pxDown,
                    s: "0", // full position size
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
    async (_types, { client }, _, t) => {
        await t.step("registerAsset", async () => {
            await assertRejects(
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
                            schema: null,
                        },
                    }),
                ApiRequestError,
                "Error deploying perp:",
            );
        });
        await t.step("setOracle", async () => {
            await assertRejects(
                () =>
                    client.perpDeploy({
                        setOracle: {
                            dex: "test",
                            oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
                            markPxs: [[["TEST0", "3.0"], ["TEST1", "14"]]],
                        },
                    }),
                ApiRequestError,
                "Error deploying perp:",
            );
        });
    },
);

export type MethodReturnType_registerReferrer = Awaited<ReturnType<ExchangeClient["registerReferrer"]>>;
run(
    "registerReferrer",
    async (types, { client }) => {
        await client.registerReferrer({ code: "TEST" })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                anyFnSuccess([
                    () => assertIsError(e, ApiRequestError, "Referral code already registered"),
                    () =>
                        assertIsError(
                            e,
                            ApiRequestError,
                            "Cannot generate referral code until enough volume traded",
                        ),
                ]);
            });
    },
);

export type MethodReturnType_reserveRequestWeight = Awaited<ReturnType<ExchangeClient["reserveRequestWeight"]>>;
run(
    "reserveRequestWeight",
    async (types, { client }) => {
        const data = await client.reserveRequestWeight({ weight: 1 });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_scheduleCancel = Awaited<ReturnType<ExchangeClient["scheduleCancel"]>>;
run(
    "scheduleCancel",
    async (types, { client }) => {
        await client.scheduleCancel({ time: Date.now() + 30000 })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Cannot set scheduled cancel time until enough volume traded");
            });
    },
);

export type MethodReturnType_setDisplayName = Awaited<ReturnType<ExchangeClient["setDisplayName"]>>;
run(
    "setDisplayName",
    async (types, { client }) => {
        const data = await client.setDisplayName({ displayName: "" });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_setReferrer = Awaited<ReturnType<ExchangeClient["setReferrer"]>>;
run(
    "setReferrer",
    async (types, { client }) => {
        await client.setReferrer({ code: "TEST" })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                anyFnSuccess([
                    () => assertIsError(e, ApiRequestError, "Cannot self-refer"),
                    () => assertIsError(e, ApiRequestError, "Referrer already set"),
                ]);
            });
    },
);

export type MethodReturnType_spotDeploy = Awaited<ReturnType<ExchangeClient["spotDeploy"]>>;
run(
    "spotDeploy",
    async (_types, { client }, _, t) => {
        await t.step("registerToken2", async () => {
            await assertRejects(
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
            );
        });
        await t.step("userGenesis", async () => {
            await assertRejects(
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
            );
        });
        await t.step("genesis", async () => {
            await assertRejects(
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
            );
        });
        await t.step("registerSpot", async () => {
            await assertRejects(
                () =>
                    client.spotDeploy({
                        registerSpot: {
                            tokens: [0, 0],
                        },
                    }),
                ApiRequestError,
                "Error deploying spot:",
            );
        });
        await t.step("registerHyperliquidity", async () => {
            await assertRejects(
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
            );
        });
        await t.step("setDeployerTradingFeeShare", async () => {
            await assertRejects(
                () =>
                    client.spotDeploy({
                        setDeployerTradingFeeShare: {
                            token: 0,
                            share: "0%",
                        },
                    }),
                ApiRequestError,
                "Error deploying spot:",
            );
        });
    },
);

export type MethodReturnType_spotSend = Awaited<ReturnType<ExchangeClient["spotSend"]>>;
run(
    "spotSend",
    async (types, { client }) => {
        const data = await client.spotSend({
            destination: "0x0000000000000000000000000000000000000001",
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "1",
        });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_subAccountModify = Awaited<ReturnType<ExchangeClient["subAccountModify"]>>;
run(
    "subAccountModify",
    async (types, { client }, { subAccountUser }) => {
        await client.subAccountModify({ subAccountUser, name: String(Date.now()) })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, `Sub-account ${subAccountUser} is not registered to`);
            });
    },
    { subAccountUser: SUB_ACCOUNT_ADDRESS } as const,
);

export type MethodReturnType_spotUser = Awaited<ReturnType<ExchangeClient["spotUser"]>>;
run(
    "spotUser",
    async (types, { client }) => {
        await client.spotUser({ toggleSpotDusting: { optOut: true } })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Already opted out of spot dusting");
            });
    },
);

export type MethodReturnType_subAccountSpotTransfer = Awaited<ReturnType<ExchangeClient["subAccountSpotTransfer"]>>;
run(
    "subAccountSpotTransfer",
    async (types, { client }, { subAccountUser }) => {
        await client.subAccountSpotTransfer({
            subAccountUser,
            isDeposit: true,
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "1",
        })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Invalid sub-account transfer from");
            });
    },
    { subAccountUser: SUB_ACCOUNT_ADDRESS } as const,
);

export type MethodReturnType_subAccountTransfer = Awaited<ReturnType<ExchangeClient["subAccountTransfer"]>>;
run(
    "subAccountTransfer",
    async (types, { client }, { subAccountUser }) => {
        await client.subAccountTransfer({ subAccountUser, isDeposit: true, usd: 1 })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Invalid sub-account transfer from");
            });
    },
    { subAccountUser: SUB_ACCOUNT_ADDRESS } as const,
);

export type MethodReturnType_tokenDelegate = Awaited<ReturnType<ExchangeClient["tokenDelegate"]>>;
run(
    "tokenDelegate",
    async (types, { client }, { validator }) => {
        const data = await client.tokenDelegate({ validator, wei: 1, isUndelegate: true });
        schemaCoverage(types, [data]);
    },
    { validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596" } as const,
);

export type MethodReturnType_twapCancel = Awaited<ReturnType<ExchangeClient["twapCancel"]>>;
run(
    "twapCancel",
    async (types, { client }, { asset }) => {
        // —————————— Prepare ——————————

        async function createTWAP(client: ExchangeClient, id: number, sz: string) {
            const twapOrderResult = await client.twapOrder({
                twap: {
                    a: id,
                    b: true,
                    s: sz,
                    r: false,
                    m: 5,
                    t: false,
                },
            });
            const twapId = twapOrderResult.response.data.status.running.twapId;
            return twapId;
        }

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await client.twapCancel({ a: id, t: await createTWAP(client, id, sz) });
        schemaCoverage(types, [data]);
    },
    { asset: "BTC" },
);

export type MethodReturnType_twapOrder = Awaited<ReturnType<ExchangeClient["twapOrder"]>>;
run(
    "twapOrder",
    async (types, { client }, { asset }) => {
        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

        // —————————— Test ——————————

        const data = await client.twapOrder({
            twap: {
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            },
        });
        schemaCoverage(types, [data], {
            ignoreBranchesByPath: {
                "#/properties/response/properties/data/properties/status/anyOf": [1], // error
            },
        });

        // —————————— Cleanup ——————————

        await client.twapCancel({ a: id, t: data.response.data.status.running.twapId });
    },
    { asset: "BTC" },
);

export type MethodReturnType_updateIsolatedMargin = Awaited<ReturnType<ExchangeClient["updateIsolatedMargin"]>>;
run(
    "updateIsolatedMargin",
    async (types, { client }, { asset }) => {
        // —————————— Prepare ——————————

        const { id, universe, ctx } = await getAssetData(infoClient, asset);
        const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        await client.updateLeverage({ asset: id, isCross: false, leverage: 1 });
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
            const data = await client.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 1 });
            schemaCoverage(types, [data]);
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
    async (types, { client }, { asset }) => {
        // —————————— Prepare ——————————

        const { id } = await getAssetData(infoClient, asset);

        // —————————— Test ——————————

        const data = await client.updateLeverage({ asset: id, isCross: true, leverage: 1 });
        schemaCoverage(types, [data]);
    },
    { asset: "BTC" },
);

export type MethodReturnType_usdClassTransfer = Awaited<ReturnType<ExchangeClient["usdClassTransfer"]>>;
run(
    "usdClassTransfer",
    async (types, { client }) => {
        const data = await client.usdClassTransfer({ amount: "1", toPerp: false });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_usdSend = Awaited<ReturnType<ExchangeClient["usdSend"]>>;
run(
    "usdSend",
    async (types, { client }) => {
        const data = await client.usdSend({ destination: "0x0000000000000000000000000000000000000001", amount: "1" });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_vaultDistribute = Awaited<ReturnType<ExchangeClient["vaultDistribute"]>>;
run(
    "vaultDistribute",
    async (types, { client }, { vaultAddress }) => {
        await client.vaultDistribute({ vaultAddress, usd: 1 * 1e6 })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                anyFnSuccess([
                    () => assertIsError(e, ApiRequestError, "Only leader can perform this vault action"),
                    () => assertIsError(e, ApiRequestError, "Must distribute at least $10"),
                ]);
            });
    },
    { vaultAddress: VAULT_ADDRESS } as const,
);

export type MethodReturnType_vaultModify = Awaited<ReturnType<ExchangeClient["vaultModify"]>>;
run(
    "vaultModify",
    async (types, { client }, { vaultAddress }) => {
        await client.vaultModify({ vaultAddress, allowDeposits: null, alwaysCloseOnWithdraw: null })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Only leader can perform this vault action");
            });
    },
    { vaultAddress: VAULT_ADDRESS } as const,
);

export type MethodReturnType_vaultTransfer = Awaited<ReturnType<ExchangeClient["vaultTransfer"]>>;
run(
    "vaultTransfer",
    async (types, { client }, { vaultAddress }) => {
        await client.vaultTransfer({ vaultAddress, isDeposit: false, usd: 5 * 1e6 })
            .then((data) => {
                schemaCoverage(types, [data]);
            })
            .catch((e) => {
                if (e instanceof SchemaCoverageError) throw e;
                assertIsError(e, ApiRequestError, "Cannot withdraw with zero balance in vault");
            });
    },
    { vaultAddress: VAULT_ADDRESS } as const,
);

export type MethodReturnType_withdraw3 = Awaited<ReturnType<ExchangeClient["withdraw3"]>>;
run(
    "withdraw3",
    async (types, { client, address }) => {
        const data = await client.withdraw3({ amount: "2", destination: address });
        schemaCoverage(types, [data]);
    },
);

import { createWalletClient, http } from "npm:viem@2";
import { mainnet } from "npm:viem@2/chains";
import { ethers } from "npm:ethers@6";
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
        name: "default",
        fn: async (t) => {
            await t.step("mainnet", async () => {
                const transport = new HttpTransport();
                const exchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport });

                const signatureChainId = typeof exchClient.signatureChainId === "string"
                    ? exchClient.signatureChainId
                    : await exchClient.signatureChainId();
                assertEquals(signatureChainId, "0x1");
            });

            await t.step("testnet", async () => {
                const transport = new HttpTransport();
                const exchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport, isTestnet: true });

                const signatureChainId = typeof exchClient.signatureChainId === "string"
                    ? exchClient.signatureChainId
                    : await exchClient.signatureChainId();
                assertEquals(signatureChainId, "0x1");
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
                () =>
                    exchClient.twapOrder({
                        twap: {
                            a: 0,
                            b: true,
                            s: "0",
                            r: false,
                            m: 5,
                            t: false,
                        },
                    }),
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
                () =>
                    exchClient.twapOrder({
                        twap: {
                            a: 0,
                            b: true,
                            s: "0",
                            r: false,
                            m: 5,
                            t: false,
                        },
                    }),
                ApiRequestError,
                "Order has zero size.",
            );
        },
        ignore: !METHODS_TO_TEST.includes("_validateResponse"),
    });
});
