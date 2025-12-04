import * as v from "@valibot/valibot";
import { UserTwapSliceFillsRequest, UserTwapSliceFillsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userTwapSliceFills",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userTwapSliceFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(UserTwapSliceFillsResponse, data, {
      ignoreDefinedTypes: [
        "#/items/properties/fill/properties/twapId",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userTwapSliceFills",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(UserTwapSliceFillsRequest, data);
  },
});
