import * as v from "@valibot/valibot";
import { ExchangeStatusRequest, ExchangeStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "exchangeStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.exchangeStatus(),
    ]);
    schemaCoverage(ExchangeStatusResponse, data, [
      "#/properties/specialStatuses",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "exchangeStatus",
    ]);
    v.parse(ExchangeStatusRequest, data);
  },
});
