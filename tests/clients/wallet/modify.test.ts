import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
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

export type MethodReturnType = ReturnType<WalletClient["modify"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("modify", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // Preparation of orders

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

            const result = await walletClient.modify({
                oid: "resting" in order ? order.resting.oid : order.filled.oid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
            });
            assertJsonSchema(MethodReturnType, result);

            // —————————— Cleanup ——————————

            const openOrders = await publicClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await walletClient.cancel({ cancels });
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

            const result = await walletClient.modify({
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
            });
            assertJsonSchema(MethodReturnType, result);

            // —————————— Cleanup ——————————

            const openOrders = await publicClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await walletClient.cancel({ cancels });
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

            const result = await walletClient.modify({
                oid: "resting" in order ? order.resting.oid : order.filled.oid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
            });
            assertJsonSchema(MethodReturnType, result);

            // —————————— Cleanup ——————————

            const openOrders = await publicClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await walletClient.cancel({ cancels });
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

            const result = await walletClient.modify({
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
            });
            assertJsonSchema(MethodReturnType, result);

            // —————————— Cleanup ——————————

            const openOrders = await publicClient.openOrders({ user: account.address });
            const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
            await walletClient.cancel({ cancels });
        });
    });
});
