import { TwapOrderSuccessResponse } from "@nktkas/hyperliquid/schemas";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { formatSize, getAssetData, runTest } from "./_t.ts";

runTest("twapOrder", { perp: "60" }, async (_t, clients) => {
    // —————————— Prepare ——————————

    const { id, universe, ctx } = await getAssetData("SOL");
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        clients.exchange.twapOrder({
            twap: {
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            },
        }),
    ]);
    schemaCoverage(TwapOrderSuccessResponse, data);

    // —————————— Cleanup ——————————

    await clients.exchange.twapCancel({ a: id, t: data[0].response.data.status.running.twapId });
});
