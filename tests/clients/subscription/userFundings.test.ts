import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["userFundings"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.userFundings({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignoreTypesByPath: {
            "#/properties/fundings/items/properties/nSamples": ["number"],
        },
    });
}

runTest("userFundings", testFn, "api");
