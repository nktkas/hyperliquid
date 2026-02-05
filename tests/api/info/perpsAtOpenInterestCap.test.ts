import * as v from "@valibot/valibot";
import { PerpsAtOpenInterestCapRequest, PerpsAtOpenInterestCapResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "perpsAtOpenInterestCap",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpsAtOpenInterestCap(),
    ]);
    schemaCoverage(PerpsAtOpenInterestCapResponse, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpsAtOpenInterestCap",
    ]);
    v.parse(PerpsAtOpenInterestCapRequest, data);
  },
});
