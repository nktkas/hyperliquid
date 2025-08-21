import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["fundingHistory"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.fundingHistory({
        coin: "ETH",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("fundingHistory", testFn);
