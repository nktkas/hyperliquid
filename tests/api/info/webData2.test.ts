import { parser, WebData2Request, WebData2Response } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "webData2",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.webData2({ user: "0x0000000000000000000000000000000000000000" }),
      client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
      client.webData2({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
      client.webData2({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }),
    ]);
    schemaCoverage(WebData2Response, data, {
      ignoreBranches: {
        "#/properties/openOrders/items/properties/orderType": [0, 4, 5],
        "#/properties/openOrders/items/properties/tif/wrapped": [1, 3, 4],
        "#/properties/meta/properties/universe/items/properties/marginMode": [1],
      },
      ignoreEmptyArray: [
        "#/properties/twapStates",
      ],
      ignoreUndefinedTypes: [
        "#/properties/perpsAtOpenInterestCap",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "webData2", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(WebData2Request)(JSON.parse(data));
  },
});
