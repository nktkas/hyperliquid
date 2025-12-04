import * as v from "@valibot/valibot";
import { CDepositRequest, CDepositResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "cDeposit",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "HYPE", "0.00000001");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cDeposit({ wei: 1 }),
    ]);
    schemaCoverage(excludeErrorResponse(CDepositResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cDeposit",
      "--wei=1",
    ]);
    v.parse(CDepositRequest, data);
  },
});
