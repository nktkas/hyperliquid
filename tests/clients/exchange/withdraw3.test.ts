import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["withdraw3"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    const data = await client.exchange.withdraw3({
        amount: "2",
        destination: "0x0000000000000000000000000000000000000001",
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("withdraw3", testFn, { perp: "2" });
