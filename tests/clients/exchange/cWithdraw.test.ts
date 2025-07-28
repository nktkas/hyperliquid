import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["cWithdraw"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    // —————————— Prepare ——————————

    await client.exchange.cDeposit({ wei: 1 });

    // —————————— Test ——————————

    const data = await client.exchange.cWithdraw({ wei: 1 });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("cWithdraw", testFn, { evm: "0.00000001" });
