import { parser, SubAccounts2Request, SubAccounts2Response } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccounts2",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.subAccounts2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // length > 0
      client.subAccounts2({ user: "0x0000000000000000000000000000000000000001" }), // null
    ]);
    schemaCoverage(SubAccounts2Response, data, {
      ignoreBranches: {
        "#/wrapped/items/properties/dexToClearinghouseState/items/items/1/properties/assetPositions/items/properties/position/properties/leverage":
          [0],
      },
      ignoreDefinedTypes: [
        "#/wrapped/items/properties/dexToClearinghouseState/items/items/1/properties/assetPositions/items/properties/position/properties/liquidationPx",
        "#/wrapped/items/properties/spotState/properties/evmEscrows",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "subAccounts2", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(SubAccounts2Request)(data);
  },
});
