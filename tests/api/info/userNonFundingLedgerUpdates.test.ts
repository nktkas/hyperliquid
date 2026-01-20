import * as v from "@valibot/valibot";
import { UserNonFundingLedgerUpdatesRequest, UserNonFundingLedgerUpdatesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userNonFundingLedgerUpdates",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userNonFundingLedgerUpdates({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
      client.userNonFundingLedgerUpdates({ user: "0xc65008a70F511ae0407D26022ff1516422AceA94" }),
      client.userNonFundingLedgerUpdates({ user: "0x4993a3a6b03414ae9cf02a545db7a04af7c9f291" }),
      client.userNonFundingLedgerUpdates({ user: "0x11fe8a3dbc48b7b8138cdc9538015e2b928b86e8" }),
    ]);
    schemaCoverage(UserNonFundingLedgerUpdatesResponse, data, {
      ignorePicklistValues: {
        "#/items/properties/delta/variant/3/properties/leverageType": ["Cross", "Isolated"],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userNonFundingLedgerUpdates",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--startTime=1725991238683",
    ]);
    v.parse(UserNonFundingLedgerUpdatesRequest, data);
  },
});
