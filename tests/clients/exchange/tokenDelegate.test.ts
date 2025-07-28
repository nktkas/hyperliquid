import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["tokenDelegate"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    const data = await client.exchange.tokenDelegate({
        validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
        wei: 1,
        isUndelegate: false,
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("tokenDelegate", testFn, { staking: "0.00000001" });
