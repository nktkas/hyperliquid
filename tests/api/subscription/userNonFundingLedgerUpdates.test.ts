import { UserNonFundingLedgerUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userNonFundingLedgerUpdates",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserNonFundingLedgerUpdatesEvent>(async (cb) => {
      await client.userNonFundingLedgerUpdates({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.userNonFundingLedgerUpdates({ user: "0xc65008a70F511ae0407D26022ff1516422AceA94" }, cb);
      await client.userNonFundingLedgerUpdates({ user: "0x4993a3a6b03414ae9cf02a545db7a04af7c9f291" }, cb);
      await client.userNonFundingLedgerUpdates({ user: "0x11fe8a3dbc48b7b8138cdc9538015e2b928b86e8" }, cb);
    }, 10_000);
    schemaCoverage(UserNonFundingLedgerUpdatesEvent, data, {
      ignoreBranches: {
        "#/properties/nonFundingLedgerUpdates/items/properties/delta": [1, 3, 4, 6, 7, 8, 10, 11, 14],
      },
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
      ignoreNullTypes: [
        "#/properties/nonFundingLedgerUpdates/items/properties/delta/variant/5/properties/nonce", // HACK: The equivalent API method in the info endpoint does not have this problem
      ],
    });
  },
});
