import { CancelSuccessResponse } from "@nktkas/hyperliquid/schemas";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid, runTest } from "./_t.ts";

runTest("cancelByCloid", { perp: "15" }, async (_t, clients) => {
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
                c: randomCloid(),
            }],
            grouping: "na",
        });
        const [order] = openOrderRes.response.data.statuses;
        return "resting" in order ? order.resting.cloid! : order.filled.cloid!;
    }

    const { id, universe, ctx } = await getAssetData("SOL");
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        clients.exchange.cancelByCloid({
            cancels: [{
                asset: id,
                cloid: await openOrder(id, pxDown, sz),
            }],
        }),
    ]);
    schemaCoverage(CancelSuccessResponse, data);
});
