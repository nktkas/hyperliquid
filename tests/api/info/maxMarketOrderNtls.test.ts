import * as v from "@valibot/valibot";
import { MaxMarketOrderNtlsRequest, MaxMarketOrderNtlsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "maxMarketOrderNtls",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.maxMarketOrderNtls(),
    ]);
    schemaCoverage(MaxMarketOrderNtlsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "maxMarketOrderNtls",
    ]);
    v.parse(MaxMarketOrderNtlsRequest, data);
  },
});
