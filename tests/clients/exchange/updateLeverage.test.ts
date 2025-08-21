import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { getAssetData, runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["updateLeverage"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    // —————————— Prepare ——————————

    const { id } = await getAssetData("ETH");

    // —————————— Test ——————————

    const data = await client.exchange.updateLeverage({ asset: id, isCross: true, leverage: 1 });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("updateLeverage", testFn);
