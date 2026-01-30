import * as v from "@valibot/valibot";
import { UserFillsRequest, UserFillsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userFills",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
      client.userFills({ user: "0x8172cc20bc3a55dcd07c75dd37ac0c2534de3b84" }),
    ]);
    schemaCoverage(UserFillsResponse, data, {
      ignoreDefinedTypes: ["#/items/intersect/0/properties/twapId"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userFills",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(UserFillsRequest, data);
  },
});
