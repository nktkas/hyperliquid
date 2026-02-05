import * as v from "@valibot/valibot";
import { AllMidsRequest, AllMidsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "allMids",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.allMids(),
    ]);
    schemaCoverage(AllMidsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "allMids",
    ]);
    v.parse(AllMidsRequest, data);
  },
});
