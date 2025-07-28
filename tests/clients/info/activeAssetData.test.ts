import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["activeAssetData"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "BTC" }), // leverage.type = isolated
        client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "NEAR" }), // leverage.type = cross
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("activeAssetData", testFn);
