import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["userVaultEquities"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.userVaultEquities({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" });
    schemaCoverage(MethodReturnType, [data]);
}

runTest("userVaultEquities", testFn);
