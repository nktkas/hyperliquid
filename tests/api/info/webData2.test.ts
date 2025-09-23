import { parser, WebData2Request, WebData2Response } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "webData2",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(WebData2Response, data, {
      ignoreEmptyArray: [
        "#/properties/leadingVaults",
        "#/properties/twapStates",
      ],
      ignoreBranches: {
        "#/properties/openOrders/items/properties/orderType": [0, 4, 5],
        "#/properties/openOrders/items/properties/tif/union/0": [1, 3, 4],
        "#/properties/agentAddress": [0],
        "#/properties/agentValidUntil": [0],
      },
      ignoreUndefinedTypes: [
        "#/properties/spotState",
        "#/properties/perpsAtOpenInterestCap",
      ],
      ignoreDefinedTypes: [
        "#/properties/spotState/properties/evmEscrows",
        "#/properties/optOutOfSpotDusting",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "webData2", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(WebData2Request)(JSON.parse(data));
  },
});
