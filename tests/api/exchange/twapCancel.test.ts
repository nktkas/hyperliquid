import * as v from "@valibot/valibot";
import { TwapCancelRequest, TwapCancelResponse } from "@nktkas/hyperliquid/api/exchange";
import { createTWAP, runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "twapCancel",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const twap = await createTWAP(exchClient);

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.twapCancel({ a: twap.a, t: twap.twapId }),
    ]);
    schemaCoverage(excludeErrorResponse(TwapCancelResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "twapCancel",
      "--a=0",
      "--t=0",
    ]);
    v.parse(TwapCancelRequest, data);
  },
});
