import { parser, SubAccountsRequest, SubAccountsResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccounts",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.subAccounts({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // length > 0
      client.subAccounts({ user: "0x0000000000000000000000000000000000000001" }), // null
    ]);
    schemaCoverage(SubAccountsResponse, data, {
      ignoreBranches: {
        "#/wrapped/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/leverage":
          [0],
        "#/wrapped/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/liquidationPx":
          [0],
      },
      ignoreDefinedTypes: ["#/wrapped/items/properties/spotState/properties/evmEscrows"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "subAccounts", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(SubAccountsRequest)(JSON.parse(data));
  },
});
