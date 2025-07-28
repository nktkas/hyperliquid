import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["spotClearinghouseState"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.spotClearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // balances.length > 0
        client.spotClearinghouseState({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }), // evmEscrows.length > 0
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("spotClearinghouseState", testFn);
