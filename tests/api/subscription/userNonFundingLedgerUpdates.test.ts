import { UserNonFundingLedgerUpdatesEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "userNonFundingLedgerUpdates",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<UserNonFundingLedgerUpdatesEvent>(
        async (cb) => {
          await client.userNonFundingLedgerUpdates({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(UserNonFundingLedgerUpdatesEvent, data.flat(), {
      ignoreBranches: {
        "#/properties/nonFundingLedgerUpdates/items/properties/delta": [1, 3, 4, 5, 6, 7, 8, 10, 11],
      },
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
  },
});
