import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatPrice, formatSize, getAssetData, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["updateIsolatedMargin"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    // —————————— Prepare ——————————

    const { id, universe, ctx } = await getAssetData("BTC");
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    await client.exchange.updateLeverage({ asset: id, isCross: false, leverage: 1 });
    await client.exchange.order({
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
        const data = await client.exchange.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 1 });
        schemaCoverage(MethodReturnType, [data]);
    } finally {
        // —————————— Cleanup ——————————

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

runTest("updateIsolatedMargin", testFn, { perp: "15" });
