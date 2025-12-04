import * as v from "@valibot/valibot";
import { UserTwapSliceFillsByTimeRequest, UserTwapSliceFillsByTimeResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userTwapSliceFillsByTime",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userTwapSliceFillsByTime({
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365 * 5,
      }),
    ]);
    schemaCoverage(UserTwapSliceFillsByTimeResponse, data, {
      ignoreDefinedTypes: [
        "#/items/properties/fill/properties/twapId",
      ],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userTwapSliceFillsByTime",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
      "--startTime=1725991238683",
    ]);
    v.parse(UserTwapSliceFillsByTimeRequest, data);
  },
});
