import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["spotMetaAndAssetCtxs"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.spotMetaAndAssetCtxs();
    schemaCoverage(MethodReturnType, [data]);
}

runTest("spotMetaAndAssetCtxs", testFn);
