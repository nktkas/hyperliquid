import type { ExchangeClient, InfoClient, MultiSignClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["sendAsset"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    const data = await client.exchange.sendAsset({
        destination: "0x0000000000000000000000000000000000000001",
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
        fromSubAccount: "",
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("sendAsset", testFn);
