import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { getWalletAddress } from "../../../src/signing/mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatPrice, formatSize, getAssetData, randomCloid, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["batchModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
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

    const { id, universe, ctx } = await getAssetData("BTC");
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber("13").div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // resting
            client.exchange.batchModify({
                modifies: [{
                    oid: (await openOrder(client.exchange, id, pxDown, sz)).oid,
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
            client.exchange.batchModify({
                modifies: [{
                    oid: (await openOrder(client.exchange, id, pxDown, sz)).cloid,
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
            client.exchange.batchModify({
                modifies: [{
                    oid: (await openOrder(client.exchange, id, pxDown, sz)).cloid,
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
            client.exchange.batchModify({
                modifies: [{
                    oid: (await openOrder(client.exchange, id, pxDown, sz)).oid,
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
        schemaCoverage(MethodReturnType, data);
    } finally {
        // —————————— Cleanup ——————————

        const openOrders = await client.info.openOrders({ user: await getWalletAddress(client.exchange.wallet) });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await client.exchange.cancel({ cancels });
        await client.exchange.order({
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
}

runTest("batchModify", testFn, { perp: "15" });
