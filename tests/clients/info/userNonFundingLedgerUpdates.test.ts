import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["userNonFundingLedgerUpdates"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.userNonFundingLedgerUpdates({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
    });
    schemaCoverage(MethodReturnType, [data], {
        ignoreEnumValuesByPath: {
            "#/items/properties/delta/anyOf/3/properties/leverageType": ["Cross"],
        },
    });
}

runTest("userNonFundingLedgerUpdates", testFn);
