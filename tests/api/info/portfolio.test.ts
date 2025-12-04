import * as v from "@valibot/valibot";
import { PortfolioRequest, PortfolioResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "portfolio",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.portfolio({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(PortfolioResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "portfolio",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(PortfolioRequest, data);
  },
});
