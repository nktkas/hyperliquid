import * as v from "@valibot/valibot";
import { Withdraw3Request, Withdraw3Response } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest, topUpPerp } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "withdraw3",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpPerp(exchClient, "2");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.withdraw3({
        amount: "2",
        destination: "0x0000000000000000000000000000000000000001",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(Withdraw3Response), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "withdraw3",
      "--amount=2",
      "--destination=0x0000000000000000000000000000000000000001",
    ]);
    v.parse(Withdraw3Request, data);
  },
});
