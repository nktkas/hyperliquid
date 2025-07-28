import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["userNonFundingLedgerUpdates"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.userNonFundingLedgerUpdates({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignoreBranchesByPath: {
            "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf": [1, 3, 4, 5, 6, 7, 8, 10, 11],
        },
        ignoreEnumValuesByPath: {
            "#/properties/nonFundingLedgerUpdates/items/properties/delta/anyOf/3/properties/leverageType": [
                "Cross",
            ],
        },
    });
}

runTest("userNonFundingLedgerUpdates", testFn, "api");
