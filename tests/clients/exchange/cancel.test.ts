import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatPrice, formatSize, getAssetData, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["cancel"]>>;
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

    const { id, universe, ctx } = await getAssetData("ETH");
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await client.exchange.cancel({
        cancels: [{
            a: id,
            o: await openOrder(client.exchange, id, pxDown, sz),
        }],
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("cancel", testFn, { perp: "15" });
