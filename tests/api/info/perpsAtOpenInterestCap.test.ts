import { parser, PerpsAtOpenInterestCapRequest, PerpsAtOpenInterestCapResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "perpsAtOpenInterestCap",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpsAtOpenInterestCap(),
    ]);
    schemaCoverage(PerpsAtOpenInterestCapResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "perpsAtOpenInterestCap"]);
    parser(PerpsAtOpenInterestCapRequest)(JSON.parse(data));
  },
});
