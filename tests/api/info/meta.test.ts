import * as v from "@valibot/valibot";
import { MetaRequest, MetaResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "meta",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.meta(),
      client.meta({ dex: "gato" }),
      client.meta({ dex: "meng" }),
    ]);
    schemaCoverage(MetaResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "meta",
    ]);
    v.parse(MetaRequest, data);
  },
});
