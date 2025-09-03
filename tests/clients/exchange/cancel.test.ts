import { CancelSuccessResponse } from "@nktkas/hyperliquid/schemas";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { formatPrice, formatSize, getAssetData, runTest } from "./_t.ts";

runTest("cancel", { perp: "15" }, async (_t, clients) => {
    // —————————— Prepare ——————————

    async function openOrder(id: number, pxDown: string, sz: string) {
        await clients.exchange.updateLeverage({ asset: id, isCross: true, leverage: 3 });
        const openOrderRes = await clients.exchange.order({
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

    const { id, universe, ctx } = await getAssetData("SOL");
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        clients.exchange.cancel({
            cancels: [{
                a: id,
                o: await openOrder(id, pxDown, sz),
            }],
        }),
    ]);
    schemaCoverage(CancelSuccessResponse, data);
});
