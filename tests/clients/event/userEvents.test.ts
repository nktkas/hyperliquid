import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import {
    EventClient,
    PublicClient,
    WalletClient,
    WebSocketTransport,
    type WsUserEventFill,
    type WsUserEventTwapHistory,
    type WsUserEventTwapSliceFills,
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

Deno.test("userEvents", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const tsjGenerator = tsj.createGenerator({ path: "./mod.ts", skipTypeCheck: true });
    const WsUserEventFill = tsjGenerator.createSchema("WsUserEventFill");
    const WsUserEventTwapHistory = tsjGenerator.createSchema("WsUserEventTwapHistory");
    const WsUserEventTwapSliceFills = tsjGenerator.createSchema("WsUserEventTwapSliceFills");

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

    await t.step("return type === WsUserEventFill", async (t) => {
        await t.step("Matching data to type schema", async () => {
            const data = await deadline(
                new Promise<WsUserEventFill>((resolve, reject) => {
                    const subscrPromise = eventClient.userEvents(
                        { user: walletClient.wallet.address },
                        async (data) => {
                            try {
                                if ("fills" in data) {
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
                            const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
                            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
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
                15_000,
            );
            assertJsonSchema(WsUserEventFill, data);
        });
    });
    await t.step("return type === WsUserEventTwapHistory", async (t) => {
        await t.step("Matching data to type schema", async () => {
            const data = await deadline(
                new Promise<WsUserEventTwapHistory>((resolve, reject) => {
                    const subscrPromise = eventClient.userEvents(
                        { user: walletClient.wallet.address },
                        async (data) => {
                            try {
                                if ("twapHistory" in data) {
                                    await subPromise;
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                }
                            } catch (error) {
                                reject(error);
                            }
                        },
                    );

                    // Create and close a twap for triggering the event
                    // deno-lint-ignore no-async-promise-executor
                    const subPromise = new Promise<void>(async (r2, j2) => {
                        try {
                            const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                            const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

                            const result = await walletClient.twapOrder({
                                a: id,
                                b: true,
                                s: twapSz,
                                r: false,
                                m: 5,
                                t: false,
                            });
                            const twapId = result.response.data.status.running.twapId;

                            await walletClient.twapCancel({ a: id, t: twapId });
                        } catch (error) {
                            j2(error);
                        } finally {
                            r2();
                        }
                    });
                }),
                15_000,
            );
            assertJsonSchema(WsUserEventTwapHistory, data);
        });
    });
    await t.step("return type === WsUserEventTwapSliceFills", async (t) => {
        await t.step("Matching data to type schema", async () => {
            const data = await deadline(
                new Promise<WsUserEventTwapSliceFills>((resolve, reject) => {
                    const subscrPromise = eventClient.userEvents(
                        { user: walletClient.wallet.address },
                        async (data) => {
                            try {
                                if ("twapSliceFills" in data) {
                                    await subPromise;
                                    await (await subscrPromise).unsubscribe();
                                    resolve(data);
                                }
                            } catch (error) {
                                reject(error);
                            }
                        },
                    );

                    // Create, wait, close and cancel a twap for triggering the event
                    // deno-lint-ignore no-async-promise-executor
                    const subPromise = new Promise<void>(async (r2, j2) => {
                        try {
                            const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                            const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
                            const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

                            const result = await walletClient.twapOrder({
                                a: id,
                                b: true,
                                s: twapSz,
                                r: false,
                                m: 5,
                                t: false,
                            });
                            const twapId = result.response.data.status.running.twapId;

                            await new Promise((resolve) => setTimeout(resolve, 5000));

                            await walletClient.twapCancel({ a: id, t: twapId });
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
                15_000,
            );
            assertJsonSchema(WsUserEventTwapSliceFills, data);
        });
    });
    // FIXME: Events cannot be artificially triggered
    await t.step({ name: "return type === WsUserEventFunding", fn: () => {}, ignore: true });
    await t.step({ name: "return type === WsUserEventLiquidation", fn: () => {}, ignore: true });
    await t.step({ name: "return type === WsUserEventNonUserCancel", fn: () => {}, ignore: true });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
