import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["approveBuilderFee"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    const data = await client.exchange.approveBuilderFee({
        maxFeeRate: "0.001%",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("approveBuilderFee", testFn);
