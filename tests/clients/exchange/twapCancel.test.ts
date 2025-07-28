import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatSize, getAssetData, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["twapCancel"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    // —————————— Prepare ——————————

    async function createTWAP(client: ExchangeClient, id: number, sz: string) {
        const twapOrderResult = await client.twapOrder({
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

    const { id, universe, ctx } = await getAssetData("BTC");
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await client.exchange.twapCancel({
        a: id,
        t: await createTWAP(client.exchange, id, sz),
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("twapCancel", testFn, { perp: "60" });
