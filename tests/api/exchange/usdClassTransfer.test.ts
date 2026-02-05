import * as v from "@valibot/valibot";
import { UsdClassTransferRequest, UsdClassTransferResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "usdClassTransfer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdClassTransfer({ amount: "1", toPerp: false }),
    ]);
    schemaCoverage(excludeErrorResponse(UsdClassTransferResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "usdClassTransfer",
      "--amount=1",
      "--toPerp=false",
    ]);
    v.parse(UsdClassTransferRequest, data);
  },
});
