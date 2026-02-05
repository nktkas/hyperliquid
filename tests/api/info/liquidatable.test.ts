import * as v from "@valibot/valibot";
import { LiquidatableRequest, LiquidatableResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "liquidatable",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.liquidatable(),
    ]);
    schemaCoverage(LiquidatableResponse, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "liquidatable",
    ]);
    v.parse(LiquidatableRequest, data);
  },
});
