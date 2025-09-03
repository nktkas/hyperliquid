import { TwapCancelSuccessResponse } from "@nktkas/hyperliquid/schemas";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { formatSize, getAssetData, runTest } from "./_t.ts";

runTest("twapCancel", { perp: "60" }, async (_t, clients) => {
    // —————————— Prepare ——————————

    async function createTWAP(id: number, sz: string) {
        const twapOrderResult = await clients.exchange.twapOrder({
            twap: {
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            },
        });
        const twapId = twapOrderResult.response.data.status.running.twapId;
        return twapId;
    }

    const { id, universe, ctx } = await getAssetData("SOL");
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        clients.exchange.twapCancel({ a: id, t: await createTWAP(id, sz) }),
    ]);
    schemaCoverage(TwapCancelSuccessResponse, data);
});
