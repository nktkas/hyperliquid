import * as v from "@valibot/valibot";
import { SpotMetaRequest, SpotMetaResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "spotMeta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotMeta(),
    ]);
    schemaCoverage(SpotMetaResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotMeta",
    ]);
    v.parse(SpotMetaRequest, data);
  },
});
