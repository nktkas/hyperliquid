import * as v from "@valibot/valibot";
import { BorrowLendRequest, BorrowLendResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest, topUpSpot } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "borrowLend",
  codeTestFn: async (t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "USDC", "30");

    // ========== Test ==========

    await t.step("supply", async () => {
      const data = await Promise.all([
        exchClient.borrowLend({ operation: "supply", token: 0, amount: "30" }),
      ]);
      schemaCoverage(excludeErrorResponse(BorrowLendResponse), data);
    });

    await t.step("withdraw", async () => {
      const data = await Promise.all([
        exchClient.borrowLend({ operation: "withdraw", token: 0, amount: null }),
      ]);
      schemaCoverage(excludeErrorResponse(BorrowLendResponse), data);
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "borrowLend",
      "--operation=supply",
      "--token=0",
      "--amount=30",
    ]);
    v.parse(BorrowLendRequest, data);
  },
});
