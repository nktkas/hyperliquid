import * as v from "@valibot/valibot";
import { IsVipRequest, IsVipResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "isVip",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.isVip({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(IsVipResponse, data, [
      "#/null",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "isVip",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(IsVipRequest, data);
  },
});
