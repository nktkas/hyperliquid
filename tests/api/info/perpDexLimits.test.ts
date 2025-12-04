import * as v from "@valibot/valibot";
import { PerpDexLimitsRequest, PerpDexLimitsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "perpDexLimits",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexLimits({ dex: "" }),
      client.perpDexLimits({ dex: "vntls" }),
    ]);
    schemaCoverage(PerpDexLimitsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDexLimits",
      "--dex=vntls",
    ]);
    v.parse(PerpDexLimitsRequest, data);
  },
});
