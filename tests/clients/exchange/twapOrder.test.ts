import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatSize, getAssetData, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["twapOrder"]>>;
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
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await client.exchange.twapOrder({
        twap: {
            a: id,
            b: true,
            s: sz,
            r: false,
            m: 5,
            t: false,
        },
    });
    schemaCoverage(MethodReturnType, [data], {
        ignoreBranchesByPath: {
            "#/properties/response/properties/data/properties/status/anyOf": [1], // error
        },
    });

    // —————————— Cleanup ——————————

    await client.exchange.twapCancel({ a: id, t: data.response.data.status.running.twapId });
}

runTest("twapOrder", testFn, { perp: "60" });
