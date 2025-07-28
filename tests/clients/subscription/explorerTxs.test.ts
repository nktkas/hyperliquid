import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["explorerTxs"]>[0]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.explorerTxs(resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignoreTypesByPath: {
            "#/items/properties/error": ["string"],
        },
    });
}

runTest("explorerTxs", testFn, "rpc");
