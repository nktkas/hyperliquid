import { Type } from "npm:@sinclair/typebox@^0.34.14";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import {
    EventClient,
    type Order,
    type OrderStatus,
    PublicClient,
    WalletClient,
    WebSocketTransport,
} from "../../../mod.ts";
import { assertJsonSchema, formatPrice, formatSize, getAssetData, isHex } from "../../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_PERPS_ASSET = Deno.args[1] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (typeof TEST_PERPS_ASSET !== "string") {
    throw new Error(`Expected a string, but got ${typeof TEST_PERPS_ASSET}`);
}

Deno.test("orderUpdates", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const OrderStatusArray = Type.Array(
        Type.Object({
            order: Type.Object({
                coin: Type.String(),
                side: Type.Union([Type.Literal("B"), Type.Literal("A")]),
                limitPx: Type.String(),
                sz: Type.String(),
                oid: Type.Number(),
                timestamp: Type.Number(),
                origSz: Type.String(),
                cloid: Type.Optional(Type.TemplateLiteral([Type.Literal("0x"), Type.String()])),
                reduceOnly: Type.Optional(Type.Literal(true)),
            }),
            status: Type.Union([
                Type.Literal("filled"),
                Type.Literal("open"),
                Type.Literal("canceled"),
                Type.Literal("triggered"),
                Type.Literal("rejected"),
                Type.Literal("marginCanceled"),
            ]),
            statusTimestamp: Type.Number(),
        }),
    );

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const publicClient = new PublicClient({ transport });
    const eventClient = new EventClient({ transport });
    const walletClient = new WalletClient({
        wallet: privateKeyToAccount(TEST_PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<OrderStatus<Order>[]>((resolve, reject) => {
                const subscrPromise = eventClient.orderUpdates(
                    { user: walletClient.wallet.address },
                    async (data) => {
                        try {
                            await subPromise;
                            await (await subscrPromise).unsubscribe();
                            resolve(data);
                        } catch (error) {
                            reject(error);
                        }
                    },
                );

                // Create and close an order for triggering the event
                // deno-lint-ignore no-async-promise-executor
                const subPromise = new Promise<void>(async (r2, j2) => {
                    try {
                        const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
                        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

                        const openOrder = await walletClient.order({
                            orders: [
                                {
                                    a: id,
                                    b: true,
                                    p: pxDown,
                                    s: sz,
                                    r: false,
                                    t: { limit: { tif: "Gtc" } },
                                },
                            ],
                            grouping: "na",
                        });
                        const [order] = openOrder.response.data.statuses;
                        await walletClient.cancel({
                            cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
                        });
                    } catch (error) {
                        j2(error);
                    } finally {
                        r2();
                    }
                });
            }),
            25_000,
        );
        assertJsonSchema(OrderStatusArray, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'status'", async (t) => {
                await t.step("some should be 'filled'", async () => {
                    const data = await deadline(
                        new Promise<OrderStatus<Order>[]>((resolve, reject) => {
                            const subscrPromise = eventClient.orderUpdates(
                                { user: walletClient.wallet.address },
                                async (data) => {
                                    try {
                                        if (data.some((x) => x.status === "filled")) {
                                            await subPromise;
                                            await (await subscrPromise).unsubscribe();
                                            resolve(data);
                                        }
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );

                            // Create and close an position for triggering the event
                            // deno-lint-ignore no-async-promise-executor
                            const subPromise = new Promise<void>(async (r2, j2) => {
                                try {
                                    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                                    const pxUp = formatPrice(
                                        new BigNumber(ctx.markPx).times(1.01),
                                        universe.szDecimals,
                                    );
                                    const pxDown = formatPrice(
                                        new BigNumber(ctx.markPx).times(0.99),
                                        universe.szDecimals,
                                    );
                                    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

                                    await walletClient.order({
                                        orders: [
                                            {
                                                a: id,
                                                b: true,
                                                p: pxUp,
                                                s: sz,
                                                r: false,
                                                t: { limit: { tif: "Gtc" } },
                                            },
                                        ],
                                        grouping: "na",
                                    });

                                    await walletClient.order({
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
                                } catch (error) {
                                    j2(error);
                                } finally {
                                    r2();
                                }
                            });
                        }),
                        25_000,
                    );
                    assertJsonSchema(OrderStatusArray, data);
                });
                await t.step("some should be 'open'", async () => {
                    const data = await deadline(
                        new Promise<OrderStatus<Order>[]>((resolve, reject) => {
                            const subscrPromise = eventClient.orderUpdates(
                                { user: walletClient.wallet.address },
                                async (data) => {
                                    try {
                                        if (data.some((x) => x.status === "open")) {
                                            await subPromise;
                                            await (await subscrPromise).unsubscribe();
                                            resolve(data);
                                        }
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );

                            // Create and close an order for triggering the event
                            // deno-lint-ignore no-async-promise-executor
                            const subPromise = new Promise<void>(async (r2, j2) => {
                                try {
                                    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                                    const pxDown = formatPrice(
                                        new BigNumber(ctx.markPx).times(0.99),
                                        universe.szDecimals,
                                    );
                                    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

                                    const openOrder = await walletClient.order({
                                        orders: [
                                            {
                                                a: id,
                                                b: true,
                                                p: pxDown,
                                                s: sz,
                                                r: false,
                                                t: { limit: { tif: "Gtc" } },
                                            },
                                        ],
                                        grouping: "na",
                                    });
                                    const [order] = openOrder.response.data.statuses;
                                    await walletClient.cancel({
                                        cancels: [{
                                            a: id,
                                            o: "resting" in order ? order.resting.oid : order.filled.oid,
                                        }],
                                    });
                                } catch (error) {
                                    j2(error);
                                } finally {
                                    r2();
                                }
                            });
                        }),
                        25_000,
                    );
                    assertJsonSchema(OrderStatusArray, data);
                });
                await t.step("some should be 'canceled'", async () => {
                    const data = await deadline(
                        new Promise<OrderStatus<Order>[]>((resolve, reject) => {
                            const subscrPromise = eventClient.orderUpdates(
                                { user: walletClient.wallet.address },
                                async (data) => {
                                    try {
                                        if (data.some((x) => x.status === "canceled")) {
                                            await subPromise;
                                            await (await subscrPromise).unsubscribe();
                                            resolve(data);
                                        }
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );

                            // Create and close an order for triggering the event
                            // deno-lint-ignore no-async-promise-executor
                            const subPromise = new Promise<void>(async (r2, j2) => {
                                try {
                                    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                                    const pxDown = formatPrice(
                                        new BigNumber(ctx.markPx).times(0.99),
                                        universe.szDecimals,
                                    );
                                    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

                                    const openOrder = await walletClient.order({
                                        orders: [
                                            {
                                                a: id,
                                                b: true,
                                                p: pxDown,
                                                s: sz,
                                                r: false,
                                                t: { limit: { tif: "Gtc" } },
                                            },
                                        ],
                                        grouping: "na",
                                    });
                                    const [order] = openOrder.response.data.statuses;
                                    await walletClient.cancel({
                                        cancels: [{
                                            a: id,
                                            o: "resting" in order ? order.resting.oid : order.filled.oid,
                                        }],
                                    });
                                } catch (error) {
                                    j2(error);
                                } finally {
                                    r2();
                                }
                            });
                        }),
                        25_000,
                    );
                    assertJsonSchema(OrderStatusArray, data);
                });
                // FIME: Incomplete check
                await t.step({ name: "some should be 'triggered'", fn: () => {}, ignore: true });
                await t.step({ name: "some should be 'rejected'", fn: () => {}, ignore: true });
                await t.step({ name: "some should be 'marginCanceled'", fn: () => {}, ignore: true });
            });
        },
        ignore: !isMatchToScheme,
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
