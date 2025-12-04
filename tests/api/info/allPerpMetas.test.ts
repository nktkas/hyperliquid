import * as v from "@valibot/valibot";
import { AllPerpMetasRequest, AllPerpMetasResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "allPerpMetas",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.allPerpMetas(),
    ]);
    schemaCoverage(AllPerpMetasResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "allPerpMetas",
    ]);
    v.parse(AllPerpMetasRequest, data);
  },
});
