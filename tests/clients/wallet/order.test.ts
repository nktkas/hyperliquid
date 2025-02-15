import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assert } from "jsr:@std/assert@^1.0.10";
import { assertJsonSchema, formatPrice, formatSize, getAssetData, isHex, randomCloid } from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_PERPS_ASSET = Deno.args[1] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (typeof TEST_PERPS_ASSET !== "string") {
    throw new Error(`Expected a string, but got ${typeof TEST_PERPS_ASSET}`);
}

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<WalletClient["order"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("order", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    await t.step("Check response schema", async (t) => {
        await t.step("should be 'resting'", async () => {
            const result = await walletClient.order({
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
            const [order] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid === undefined, "'cloid' should be 'undefined'");

            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
            });
        });

        await t.step("should be 'filled'", async () => {
            const result = await walletClient.order({
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

            assertJsonSchema(MethodReturnType, result);
            assert("filled" in result.response.data.statuses[0], "filled is not defined");
            assert(result.response.data.statuses[0].filled.cloid === undefined, "'cloid' should be 'undefined'");

            // —————————— Cleanup ——————————

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
        });
    });

    await t.step("Check arguments", async (t) => {
        await t.step("builder", async () => {
            const result = await walletClient.order({
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
                builder: { b: account.address, f: 1 },
            });
            const [order] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
            });
        });

        await t.step("trigger", async (t) => {
            await t.step("tpsl: tp", async () => {
                const result = await walletClient.order({
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
                });
                const [order] = result.response.data.statuses;

                assertJsonSchema(MethodReturnType, result);
                assert("resting" in result.response.data.statuses[0], "resting is not defined");

                // —————————— Cleanup ——————————

                await walletClient.cancel({
                    cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
                });
            });

            await t.step("tpsl: sl", async () => {
                const result = await walletClient.order({
                    orders: [{
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: {
                            trigger: {
                                isMarket: true,
                                triggerPx: pxUp,
                                tpsl: "sl",
                            },
                        },
                    }],
                    grouping: "na",
                });
                const [order] = result.response.data.statuses;

                assertJsonSchema(MethodReturnType, result);
                assert("resting" in result.response.data.statuses[0], "resting is not defined");

                // —————————— Cleanup ——————————

                await walletClient.cancel({
                    cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
                });
            });
        });

        await t.step("c", async () => {
            const result = await walletClient.order({
                orders: [
                    {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    },
                ],
                grouping: "na",
            });
            const [order] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid !== undefined, "'cloid' should be defined");

            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
            });
        });
    });
});
