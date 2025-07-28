import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["txDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.txDetails({ hash: "0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71" }), // error = null
        client.txDetails({ hash: "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06" }), // error = string
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("txDetails", testFn);
