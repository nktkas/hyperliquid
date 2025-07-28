import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["delegatorHistory"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.delegatorHistory({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("delegatorHistory", testFn);
