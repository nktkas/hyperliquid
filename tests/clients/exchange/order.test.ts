import { OrderSuccessResponse } from "@nktkas/hyperliquid/schemas";
import { BigNumber } from "npm:bignumber.js@9";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid, runTest } from "./_t.ts";

runTest("order", { perp: "15" }, async (_t, clients) => {
    // —————————— Prepare ——————————

    const { id, universe, ctx } = await getAssetData("SOL");
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // resting
            clients.exchange.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            }),
            // resting | cloid
            clients.exchange.order({
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
            }),
            // filled
            clients.exchange.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            }),
            // filled | cloid
            clients.exchange.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: randomCloid(),
                }],
                grouping: "na",
            }),
        ]);
        schemaCoverage(OrderSuccessResponse, data);
    } finally {
        // —————————— Cleanup ——————————

        const openOrders = await clients.info.openOrders({ user: await getWalletAddress(clients.exchange.wallet) });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await clients.exchange.cancel({ cancels });
        await clients.exchange.order({
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
});
