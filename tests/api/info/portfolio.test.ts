import { parser, PortfolioRequest, PortfolioResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "portfolio",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.portfolio({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(PortfolioResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "portfolio", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
    parser(PortfolioRequest)(JSON.parse(data));
  },
});
