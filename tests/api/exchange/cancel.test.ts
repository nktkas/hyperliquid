import * as v from "@valibot/valibot";
import { CancelRequest, CancelResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, openOrder, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "cancel",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const order = await openOrder(exchClient, "limit");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.cancel({ cancels: [{ a: order.a, o: order.oid }] }),
    ]);
    schemaCoverage(excludeErrorResponse(CancelResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "cancel",
      `--cancels=${JSON.stringify([{ a: 0, o: 0 }])}`,
    ]);
    v.parse(CancelRequest, data);
  },
});
