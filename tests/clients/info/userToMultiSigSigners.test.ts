import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["userToMultiSigSigners"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.userToMultiSigSigners({ user: "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb" }), // { ... }
        client.userToMultiSigSigners({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // null
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("userToMultiSigSigners", testFn);
