import * as v from "@valibot/valibot";
import { CancelByCloidRequest, CancelByCloidResponse } from "@nktkas/hyperliquid/api/exchange";
import { openOrder, runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "cancelByCloid",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const order = await openOrder(exchClient, "limit");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cancelByCloid({ cancels: [{ asset: order.a, cloid: order.cloid }] }),
    ]);
    schemaCoverage(excludeErrorResponse(CancelByCloidResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cancelByCloid",
      `--cancels=${JSON.stringify([{ asset: 0, cloid: "0x17a5a40306205a0c6d60c7264153781c" }])}`,
    ]);
    v.parse(CancelByCloidRequest, data);
  },
});
