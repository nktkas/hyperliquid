import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["delegatorRewards"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.delegatorRewards({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }), // source = delegation
        client.delegatorRewards({ user: "0x3c83a5cae32a05e88ca6a0350edb540194851a76" }), // source = commission
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("delegatorRewards", testFn);
