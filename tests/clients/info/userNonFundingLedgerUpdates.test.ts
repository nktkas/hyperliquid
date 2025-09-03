import { UserNonFundingLedgerUpdate } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userNonFundingLedgerUpdates", async (_t, client) => {
    const data = await Promise.all([
        client.userNonFundingLedgerUpdates({
            user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        }),
    ]);
    schemaCoverage(v.array(UserNonFundingLedgerUpdate), data, {
        ignoreBranches: {
            "#/items/properties/delta/union/3/properties/leverageType": [0],
        },
    });
});
