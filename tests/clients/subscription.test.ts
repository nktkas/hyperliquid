import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import type { SchemaObject } from "npm:ajv@8";
import { privateKeyToAddress } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import {
    ExchangeClient,
    type Hex,
    HttpTransport,
    InfoClient,
    SubscriptionClient,
    WebSocketTransport,
} from "../../mod.ts";
import { schemaGenerator } from "../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../_utils/utils.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 3000 }, string: ["_"] }) as Args<{
    /** Delay to avoid rate limits */
    wait: number;
}>;

const PRIVATE_KEY = cliArgs._[0] as Hex; // must be sole signer for a multi-sign account

const METHODS_TO_TEST = [ // controls which tests to run
    "activeAssetCtx",
    "activeAssetData",
    "allMids",
    "bbo",
    "candle",
    "explorerBlock",
    "explorerTxs",
    "l2Book",
    "notification",
    "orderUpdates",
    "trades",
    "userEvents",
    "userFills",
    "userFundings",
    "userNonFundingLedgerUpdates",
    "userTwapHistory",
    "userTwapSliceFills",
    "webData2",
];

// —————————— Tests ——————————

const transport = new HttpTransport({ isTestnet: true });
const exchClient = new ExchangeClient({ wallet: PRIVATE_KEY, transport, isTestnet: true });
const infoClient = new InfoClient({ transport });

function run<T extends Record<string, unknown>>(
    name: string,
    fn: (types: SchemaObject, args: T) => Promise<void>,
    args: T = {} as T,
    requiredPrivateKey = false,
) {
    Deno.test(
        name,
        { ignore: !METHODS_TO_TEST.includes(name) || requiredPrivateKey && !PRIVATE_KEY },
        async () => {
            const MethodReturnType = schemaGenerator(import.meta.url, `MethodReturnType_${name}`);
            await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits
            await fn(MethodReturnType, args);
        },
    );
}

export type MethodReturnType_activeAssetCtx = Parameters<Parameters<SubscriptionClient["activeAssetCtx"]>[1]>[0];
run(
    "activeAssetCtx",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await Promise.all([
            // Check response 'WsActiveAssetCtx'
            deadline(
                new Promise((resolve) => {
                    subsClient.activeAssetCtx({ coin: "BTC" }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.activeAssetCtx({ coin: "AXL" }, resolve);
                }),
                10_000,
            ),
            // Check response 'WsActiveSpotAssetCtx'
            deadline(
                new Promise((resolve) => {
                    subsClient.activeAssetCtx({ coin: "@107" }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.activeAssetCtx({ coin: "@27" }, resolve);
                }),
                10_000,
            ),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_activeAssetData = Parameters<Parameters<SubscriptionClient["activeAssetData"]>[1]>[0];
run(
    "activeAssetData",
    async (types, { coin1, coin2, user }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await Promise.all([
            // Check argument 'leverage.type'
            deadline(
                new Promise((resolve) => {
                    subsClient.activeAssetData({ coin: coin1, user }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.activeAssetData({ coin: coin2, user }, resolve);
                }),
                10_000,
            ),
        ]);
        schemaCoverage(types, data);
    },
    { coin1: "GALA", coin2: "NEAR", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_allMids = Parameters<Parameters<SubscriptionClient["allMids"]>[1]>[0];
run(
    "allMids",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data1 = await deadline(
            new Promise((resolve) => {
                subsClient.allMids(resolve);
            }),
            10_000,
        );
        const data2 = await deadline(
            new Promise((resolve) => {
                subsClient.allMids({ dex: "test" }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data1, data2]);
    },
);

export type MethodReturnType_bbo = Parameters<Parameters<SubscriptionClient["bbo"]>[1]>[0];
run(
    "bbo",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.bbo({ coin: "BTC" }, resolve);
            }),
            120_000,
        );
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_candle = Parameters<Parameters<SubscriptionClient["candle"]>[1]>[0];
run(
    "candle",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.candle({ coin: "BTC", interval: "1m" }, resolve);
            }),
            90_000,
        );
        schemaCoverage(types, [data], {
            ignoreEnumValuesByPath: {
                "#/properties/i": [
                    "1m",
                    "3m",
                    "5m",
                    "15m",
                    "30m",
                    "1h",
                    "2h",
                    "4h",
                    "8h",
                    "12h",
                    "1d",
                    "3d",
                    "1w",
                    "1M",
                ],
            },
        });
    },
);

export type MethodReturnType_explorerBlock = Parameters<Parameters<SubscriptionClient["explorerBlock"]>[0]>[0];
run(
    "explorerBlock",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.explorerBlock(resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_explorerTxs = Parameters<Parameters<SubscriptionClient["explorerTxs"]>[0]>[0];
run(
    "explorerTxs",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.explorerTxs(resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data], {
            ignoreTypesByPath: {
                "#/items/properties/error": ["string"],
            },
        });
    },
);

export type MethodReturnType_l2Book = Parameters<Parameters<SubscriptionClient["l2Book"]>[1]>[0];
run(
    "l2Book",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await Promise.all([
            // Check without arguments
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC" }, resolve);
                }),
                10_000,
            ),
            // Check argument 'nSigFigs'
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC", nSigFigs: 2 }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC", nSigFigs: 3 }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC", nSigFigs: 4 }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC", nSigFigs: 5 }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC", nSigFigs: null }, resolve);
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book({ coin: "BTC", nSigFigs: undefined }, resolve);
                }),
                10_000,
            ),
            // Check argument 'mantissa'
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book(
                        { coin: "BTC", nSigFigs: 5, mantissa: 2 },
                        resolve,
                    );
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book(
                        { coin: "BTC", nSigFigs: 5, mantissa: 5 },
                        resolve,
                    );
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book(
                        { coin: "BTC", nSigFigs: 5, mantissa: null },
                        resolve,
                    );
                }),
                10_000,
            ),
            deadline(
                new Promise((resolve) => {
                    subsClient.l2Book(
                        { coin: "BTC", nSigFigs: 5, mantissa: undefined },
                        resolve,
                    );
                }),
                10_000,
            ),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_notification = Parameters<Parameters<SubscriptionClient["notification"]>[1]>[0];
run(
    "notification",
    async (types, { asset }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        // —————————— Prepare ——————————

        async function openCloseTwap(
            infoClient: InfoClient,
            exchClient: ExchangeClient,
            asset: string,
            buy: boolean,
            position: boolean,
        ): Promise<void> {
            const { id, universe, ctx } = await getAssetData(infoClient, asset);
            const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
            const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

            const result = await exchClient.twapOrder({
                twap: {
                    a: id,
                    b: buy,
                    s: twapSz,
                    r: false,
                    m: 5,
                    t: false,
                },
            });
            const twapId = result.response.data.status.running.twapId;

            if (position) await new Promise((resolve) => setTimeout(resolve, 3000));

            await exchClient.twapCancel({ a: id, t: twapId });

            if (position) {
                await exchClient.order({
                    orders: [{
                        a: id,
                        b: !buy,
                        p: buy ? pxDown : pxUp,
                        s: "0", // Full position size
                        r: true,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                }).catch(() => undefined);
            }
        }

        // —————————— Test ——————————

        const data = await deadline(
            // deno-lint-ignore no-async-promise-executor
            new Promise<unknown[]>(async (resolve, reject) => {
                const events: unknown[] = [];
                await subsClient.notification({ user: privateKeyToAddress(exchClient.wallet) }, async (data) => {
                    try {
                        events.push(data);
                        await twapFillPromise;
                        resolve(events);
                    } catch (error) {
                        reject(error);
                    }
                });

                const twapFillPromise = openCloseTwap(infoClient, exchClient, asset, true, true);
            }),
            20_000,
        );
        schemaCoverage(types, data);
    },
    { asset: "BTC" },
    true,
);

export type MethodReturnType_orderUpdates = Parameters<Parameters<SubscriptionClient["orderUpdates"]>[1]>[0];
run(
    "orderUpdates",
    async (types, { asset }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        // —————————— Prepare ——————————

        async function createOrder(
            infoClient: InfoClient,
            exchClient: ExchangeClient,
            asset: string,
            mode: "open_filled" | "open_canceled" | "rejected",
        ): Promise<void> {
            const { id, universe, ctx } = await getAssetData(infoClient, asset);
            const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
            const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

            if (mode === "open_filled") {
                await exchClient.order({
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
                });

                await exchClient.order({
                    orders: [{
                        a: id,
                        b: false,
                        p: pxDown,
                        s: "0",
                        r: true,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    }],
                    grouping: "na",
                }).catch(() => undefined);
            } else if (mode === "open_canceled") {
                const openOrder = await exchClient.order({
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

                const [order] = openOrder.response.data.statuses;
                await exchClient.cancel({
                    cancels: [{
                        a: id,
                        o: "resting" in order ? order.resting.oid : order.filled.oid,
                    }],
                });
            } else if (mode === "rejected") {
                await exchClient.order({
                    orders: [{
                        a: id,
                        b: false,
                        p: pxDown,
                        s: "0",
                        r: true,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                }).catch(() => undefined);
            }
        }

        // —————————— Test ——————————

        const data = await deadline(
            // deno-lint-ignore no-async-promise-executor
            new Promise<unknown[]>(async (resolve, reject) => {
                const events: unknown[] = [];
                await subsClient.orderUpdates({ user: privateKeyToAddress(exchClient.wallet) }, async (data) => {
                    try {
                        events.push(data);
                        if (events.length === 1) { // Only first event should trigger promise
                            await Promise.all([order1Promise, order2Promise, order3Promise]);
                            await new Promise((r) => setTimeout(r, 3000));
                            resolve(events);
                        }
                    } catch (error) {
                        reject(error);
                    }
                });

                const order1Promise = createOrder(infoClient, exchClient, asset, "open_filled");
                const order2Promise = createOrder(infoClient, exchClient, asset, "open_canceled");
                const order3Promise = createOrder(infoClient, exchClient, asset, "rejected");
            }),
            20_000,
        );
        schemaCoverage(types, data, {
            ignoreEnumValuesByPath: {
                "#/items/properties/status": [
                    "triggered",
                    "delistedCanceled",
                    "liquidatedCanceled",
                    "marginCanceled",
                    "openInterestCapCanceled",
                    "reduceOnlyCanceled",
                    "scheduledCancel",
                    "selfTradeCanceled",
                    "siblingFilledCanceled",
                    "vaultWithdrawalCanceled",
                    "rejected",
                ],
            },
        });
    },
    { asset: "BTC" },
    true,
);

export type MethodReturnType_trades = Parameters<Parameters<SubscriptionClient["trades"]>[1]>[0];
run(
    "trades",
    async (types) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.trades({ coin: "BTC" }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data], {
            ignoreEnumValuesByPath: {
                "#/items/properties/side": ["B", "A"], // some of them may be missing
            },
        });
    },
);

export type MethodReturnType_userEvents = Parameters<Parameters<SubscriptionClient["userEvents"]>[1]>[0];
run(
    "userEvents",
    async (types, { asset1, asset2 }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        // —————————— Prepare ——————————

        async function openCloseOrder(
            infoClient: InfoClient,
            exchClient: ExchangeClient,
            asset: string,
            buy: boolean,
        ): Promise<void> {
            const { id, universe, ctx } = await getAssetData(infoClient, asset);
            const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
            const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

            await exchClient.order({
                orders: [
                    {
                        a: id,
                        b: buy,
                        p: buy ? pxUp : pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: buy ? randomCloid() : undefined,
                    },
                ],
                grouping: "na",
            });

            await exchClient.order({
                orders: [{
                    a: id,
                    b: !buy,
                    p: buy ? pxDown : pxUp,
                    s: "0", // Full position size
                    r: true,
                    t: { limit: { tif: "Gtc" } },
                    c: buy ? randomCloid() : undefined,
                }],
                grouping: "na",
            });
        }
        async function openCloseTwap(
            infoClient: InfoClient,
            exchClient: ExchangeClient,
            asset: string,
            buy: boolean,
            position: boolean,
        ): Promise<void> {
            const { id, universe, ctx } = await getAssetData(infoClient, asset);
            const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
            const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

            const result = await exchClient.twapOrder({
                twap: {
                    a: id,
                    b: buy,
                    s: twapSz,
                    r: false,
                    m: 5,
                    t: false,
                },
            });
            const twapId = result.response.data.status.running.twapId;

            if (position) await new Promise((resolve) => setTimeout(resolve, 3000));

            await exchClient.twapCancel({ a: id, t: twapId });

            if (position) {
                await exchClient.order({
                    orders: [{
                        a: id,
                        b: !buy,
                        p: buy ? pxDown : pxUp,
                        s: "0", // Full position size
                        r: true,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                }).catch(() => undefined);
            }
        }

        // —————————— Test ——————————

        const data = await deadline(
            // deno-lint-ignore no-async-promise-executor
            new Promise<unknown[]>(async (resolve, reject) => {
                const events: unknown[] = [];
                await subsClient.userEvents({ user: privateKeyToAddress(exchClient.wallet) }, async (data) => {
                    try {
                        events.push(data);
                        if (events.length === 1) {
                            await Promise.all([
                                order1Promise,
                                order2Promise,
                                twap1Promise,
                                twap2Promise,
                                twapFill1Promise,
                                twapFill2Promise,
                            ]);
                            resolve(events);
                        }
                    } catch (error) {
                        reject(error);
                    }
                });

                const order1Promise = openCloseOrder(infoClient, exchClient, asset1, true);
                const order2Promise = openCloseOrder(infoClient, exchClient, asset2, false);

                const twap1Promise = openCloseTwap(infoClient, exchClient, asset1, true, false);
                const twap2Promise = openCloseTwap(infoClient, exchClient, asset2, false, false);

                const twapFill1Promise = openCloseTwap(infoClient, exchClient, asset1, true, true);
                const twapFill2Promise = openCloseTwap(infoClient, exchClient, asset2, false, true);
            }),
            20_000,
        );
        schemaCoverage(types, data, {
            ignoreBranchesByPath: {
                "#/anyOf": [
                    1, // WsUserEventFunding
                    2, // WsUserEventLiquidation
                    3, // WsUserEventNonUserCancel
                ],
                "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf": [
                    1, // TwapStatus.error
                ],
            },
            ignoreEnumValuesByPath: {
                "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf/0/properties/status": [
                    "finished",
                    "terminated",
                ],
            },
            ignorePropertiesByPath: [
                "#/anyOf/0/properties/fills/items/properties/liquidation",
            ],
        });
    },
    { asset1: "BTC", asset2: "ETH" },
    true,
);

export type MethodReturnType_userFills = Parameters<Parameters<SubscriptionClient["userFills"]>[1]>[0];
run(
    "userFills",
    async (types, { user }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.userFills({ user }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data], {
            ignorePropertiesByPath: [
                "#/properties/fills/items/properties/liquidation",
            ],
        });
    },
    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" } as const,
);

export type MethodReturnType_userFundings = Parameters<Parameters<SubscriptionClient["userFundings"]>[1]>[0];
run(
    "userFundings",
    async (types, { user }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.userFundings({ user }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data], {
            ignoreTypesByPath: {
                "#/properties/fundings/items/properties/nSamples": ["number"],
            },
        });
    },
    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" } as const,
);

export type MethodReturnType_userNonFundingLedgerUpdates = Parameters<
    Parameters<SubscriptionClient["userNonFundingLedgerUpdates"]>[1]
>[0];
run(
    "userNonFundingLedgerUpdates",
    async (types, { user }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.userNonFundingLedgerUpdates({ user }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data], {
            ignoreBranchesByPath: {
                "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf": [1, 3, 4, 5, 6, 7, 8, 10, 11],
            },
            ignoreEnumValuesByPath: {
                "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/3/properties/leverageType": [
                    "Cross",
                ],
            },
        });
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userTwapHistory = Parameters<Parameters<SubscriptionClient["userTwapHistory"]>[1]>[0];
run(
    "userTwapHistory",
    async (types, { user }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.userTwapHistory({ user }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userTwapSliceFills = Parameters<
    Parameters<SubscriptionClient["userTwapSliceFills"]>[1]
>[0];
run(
    "userTwapSliceFills",
    async (types, { user }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        const data = await deadline(
            new Promise((resolve) => {
                subsClient.userTwapSliceFills({ user }, resolve);
            }),
            10_000,
        );
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_webData2 = Parameters<Parameters<SubscriptionClient["webData2"]>[1]>[0];
run(
    "webData2",
    async (types, { asset1, asset2 }) => {
        await using transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
        await transport.ready();
        const subsClient = new SubscriptionClient({ transport });

        // —————————— Prepare ——————————

        async function getAssetDataExtended(infoClient: InfoClient, asset: string): Promise<{
            id: number;
            pxUp: string;
            pxDown: string;
            sz: string;
            twapSz: string;
        }> {
            const { id, universe, ctx } = await getAssetData(infoClient, asset);
            const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
            const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);
            const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);
            return { id, pxUp, pxDown, sz, twapSz };
        }

        // Get asset data
        const {
            id: id1,
            pxUp: pxUp1,
            pxDown: pxDown1,
            sz: sz1,
            twapSz: twapSz1,
        } = await getAssetDataExtended(infoClient, asset1);
        const {
            id: id2,
            pxUp: pxUp2,
            pxDown: pxDown2,
            sz: sz2,
            twapSz: twapSz2,
        } = await getAssetDataExtended(infoClient, asset2);

        // Update leverage
        await Promise.all([
            exchClient.updateLeverage({ asset: id1, isCross: true, leverage: 5 }),
            exchClient.updateLeverage({ asset: id2, isCross: false, leverage: 5 }),
        ]);

        // Create orders/positions/TWAP's and set up spot dusting opt-out
        const [twap1, twap2] = await Promise.all([
            // Create TWAP orders
            exchClient.twapOrder({
                twap: {
                    a: id1,
                    b: true,
                    s: twapSz1,
                    r: false,
                    m: 5,
                    t: false,
                },
            }),
            exchClient.twapOrder({
                twap: {
                    a: id2,
                    b: false,
                    s: twapSz2,
                    r: false,
                    m: 5,
                    t: false,
                },
            }),
            // Create orders
            exchClient.order({
                orders: [{ a: id1, b: true, p: pxDown1, s: sz1, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            }),
            exchClient.order({
                orders: [{ a: id1, b: false, p: pxUp1, s: sz1, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            }),
            exchClient.order({
                orders: [{
                    a: id1,
                    b: false,
                    p: pxUp1,
                    s: sz1,
                    r: false,
                    t: { limit: { tif: "Alo" } },
                    c: randomCloid(),
                }],
                grouping: "na",
            }),
            exchClient.order({ // orderType = "Stop Market"
                orders: [{
                    a: id1,
                    b: false,
                    p: pxDown1,
                    s: sz1,
                    r: false,
                    t: { trigger: { isMarket: true, tpsl: "sl", triggerPx: pxDown1 } },
                }],
                grouping: "na",
            }),
            exchClient.order({ // orderType = "Stop Limit"
                orders: [{
                    a: id1,
                    b: false,
                    p: pxDown1,
                    s: sz1,
                    r: false,
                    t: { trigger: { isMarket: false, tpsl: "sl", triggerPx: pxDown1 } },
                }],
                grouping: "na",
            }),
            // Create positions
            exchClient.order({
                orders: [{ a: id1, b: true, p: pxUp1, s: sz1, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            }),
            exchClient.order({
                orders: [{ a: id2, b: false, p: pxDown2, s: sz2, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            }),
            // Change spot dusting opt-out
            exchClient.spotUser({ toggleSpotDusting: { optOut: true } }),
        ]);

        // —————————— Test ——————————

        try {
            const data = await deadline(
                new Promise((resolve) => {
                    subsClient.webData2({ user: privateKeyToAddress(exchClient.wallet) }, resolve);
                }),
                10_000,
            );
            schemaCoverage(types, [data], {
                ignoreBranchesByPath: {
                    "#/properties/openOrders/items/properties/tif/anyOf": [
                        1, // tif = null
                    ],
                    "#/properties/agentAddress/anyOf": [
                        1, // agentAddress = null
                    ],
                },
                ignoreEmptyArrayPaths: [
                    "#/properties/openOrders/items/properties/children",
                ],
                ignoreEnumValuesByPath: {
                    "#/properties/openOrders/items/properties/orderType": [
                        "Market",
                        "Take Profit Limit",
                        "Take Profit Market",
                    ],
                    "#/properties/openOrders/items/properties/tif/anyOf/0": [
                        "FrontendMarket",
                        "Ioc",
                        "LiquidationMarket",
                    ],
                },
                ignoreTypesByPath: {
                    "#/properties/agentValidUntil": ["null"], // related to agentAddress
                },
                ignorePropertiesByPath: [
                    "#/properties/perpsAtOpenInterestCap",
                    "#/properties/spotState/properties/evmEscrows",
                ],
            });
        } finally {
            // —————————— Cleanup ——————————

            // Close open orders & TWAP's
            const openOrders = await infoClient.openOrders({ user: privateKeyToAddress(exchClient.wallet) });
            const cancels = openOrders.map((o) => ({ a: o.coin === asset1 ? id1 : id2, o: o.oid }));
            await Promise.all([
                exchClient.cancel({ cancels }),
                exchClient.twapCancel({ a: id1, t: twap1.response.data.status.running.twapId }),
                exchClient.twapCancel({ a: id2, t: twap2.response.data.status.running.twapId }),
            ]);

            // Close open positions
            await Promise.all([
                exchClient.order({
                    orders: [{
                        a: id1,
                        b: false,
                        p: pxDown1,
                        s: "0", // Full position size
                        r: true,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                }),
                exchClient.order({
                    orders: [{
                        a: id2,
                        b: true,
                        p: pxUp2,
                        s: "0", // Full position size
                        r: true,
                        t: { limit: { tif: "Gtc" } },
                    }],
                    grouping: "na",
                }),
            ]);

            // Change spot dusting opt-out
            await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
        }
    },
    { asset1: "BTC", asset2: "ETH" },
    true,
);
