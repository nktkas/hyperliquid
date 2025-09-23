import {
  parser,
  UserNonFundingLedgerUpdatesRequest,
  UserNonFundingLedgerUpdatesResponse,
} from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userNonFundingLedgerUpdates",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userNonFundingLedgerUpdates({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
      }),
    ]);
    schemaCoverage(UserNonFundingLedgerUpdatesResponse, data, {
      ignoreBranches: {
        "#/items/properties/delta/union/3/properties/leverageType": [0],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userNonFundingLedgerUpdates",
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--startTime",
      "1725991238683",
    ]);
    parser(UserNonFundingLedgerUpdatesRequest)(JSON.parse(data));
  },
});
