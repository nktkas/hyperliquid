import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["userRole"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.userRole({ user: "0x941a505ACc11F5f3A12b5eF0d414A8Bff45c5e77" }), // role = missing
        client.userRole({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // role = user
        client.userRole({ user: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b" }), // role = vault
        client.userRole({ user: "0xb0b3460d7bd6c01a8d7dad8b152292bf1a47883b" }), // role = agent
        client.userRole({ user: "0x22a454d3322060475552e8f922ec0c778b8e5760" }), // role = subAccount
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("userRole", testFn);
