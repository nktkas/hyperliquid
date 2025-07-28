import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["userFills"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.userFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignorePropertiesByPath: [
            "#/properties/fills/items/properties/liquidation",
        ],
    });
}

runTest("userFills", testFn, "api");
