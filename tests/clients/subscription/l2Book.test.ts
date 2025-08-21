import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["l2Book"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.l2Book({ coin: "ETH" }, resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data]);
}

runTest("l2Book", testFn, "api");
