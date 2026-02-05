import * as v from "@valibot/valibot";
import { ReserveRequestWeightRequest, ReserveRequestWeightResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "reserveRequestWeight",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.reserveRequestWeight({ weight: 1 }),
    ]);
    schemaCoverage(excludeErrorResponse(ReserveRequestWeightResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "reserveRequestWeight",
      "--weight=1",
    ]);
    v.parse(ReserveRequestWeightRequest, data);
  },
});
