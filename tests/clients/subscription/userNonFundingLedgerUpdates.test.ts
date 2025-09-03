import { WsUserNonFundingLedgerUpdates } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userNonFundingLedgerUpdates", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsUserNonFundingLedgerUpdates>((resolve) => {
                client.userNonFundingLedgerUpdates({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(WsUserNonFundingLedgerUpdates, data, {
        ignoreBranches: {
            "#/properties/nonFundingLedgerUpdates/items/properties/delta": [1, 3, 4, 5, 6, 7, 8, 10, 11],
        },
        ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
});
