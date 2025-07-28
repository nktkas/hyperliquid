import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["preTransferCheck"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.preTransferCheck({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        source: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("preTransferCheck", testFn);
