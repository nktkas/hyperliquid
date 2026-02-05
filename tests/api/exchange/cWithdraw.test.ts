import * as v from "@valibot/valibot";
import { CWithdrawRequest, CWithdrawResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "cWithdraw",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "HYPE", "0.00000001");
    await exchClient.cDeposit({ wei: 1 });

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cWithdraw({ wei: 1 }),
    ]);
    schemaCoverage(excludeErrorResponse(CWithdrawResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cWithdraw",
      "--wei=1",
    ]);
    v.parse(CWithdrawRequest, data);
  },
});
