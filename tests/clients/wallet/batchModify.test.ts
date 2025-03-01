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

export type MethodReturnType = ReturnType<WalletClient["batchModify"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("batchModify", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    await t.step("Check 'c' argument", async (t) => {
        await t.step("c: undefined", async () => {
            // —————————— Prepare ——————————

            const openOrderRes = await walletClient.order({
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

            // —————————— Test ——————————

            const result = await walletClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order ? order.resting.oid : order.filled.oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                        },
                    },
                ],
            });
            const [newOrder] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in newOrder ? newOrder.resting.oid : newOrder.filled.oid }],
            });
        });

        await t.step("c: hex", async () => {
            // —————————— Prepare ——————————

            const openOrderRes = await walletClient.order({
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

            // —————————— Test ——————————

            const result = await walletClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order ? order.resting.oid : order.filled.oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                            c: randomCloid(),
                        },
                    },
                ],
            });
            const [newOrder] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid !== undefined, "cloid is not defined");

            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in newOrder ? newOrder.resting.oid : newOrder.filled.oid }],
            });
        });
    });

    await t.step("Check 't' argument", async (t) => {
        await t.step("t: { limit: { ... } }", async () => {
            // —————————— Prepare ——————————

            const openOrderRes = await walletClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
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
            const [order] = openOrderRes.response.data.statuses;

            // —————————— Test ——————————

            const result = await walletClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order ? order.resting.oid : order.filled.oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: { limit: { tif: "Gtc" } },
                        },
                    },
                ],
            });
            const [newOrder] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in newOrder ? newOrder.resting.oid : newOrder.filled.oid }],
            });
        });

        await t.step("t: { trigger: { ... } }", async () => {
            // —————————— Prepare ——————————

            const openOrderRes = await walletClient.order({
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

            // —————————— Test ——————————

            const result = await walletClient.batchModify({
                modifies: [
                    {
                        oid: "resting" in order ? order.resting.oid : order.filled.oid,
                        order: {
                            a: id,
                            b: true,
                            p: pxDown,
                            s: sz,
                            r: false,
                            t: {
                                trigger: {
                                    isMarket: true,
                                    triggerPx: pxDown,
                                    tpsl: "tp",
                                },
                            },
                        },
                    },
                ],
            });
            const [newOrder] = result.response.data.statuses;

            assertJsonSchema(MethodReturnType, result);
            assert("resting" in result.response.data.statuses[0], "resting is not defined");
            assert(result.response.data.statuses[0].resting.cloid === undefined, "cloid is defined");

            // —————————— Cleanup ——————————

            await walletClient.cancel({
                cancels: [{ a: id, o: "resting" in newOrder ? newOrder.resting.oid : newOrder.filled.oid }],
            });
        });
    });
});
