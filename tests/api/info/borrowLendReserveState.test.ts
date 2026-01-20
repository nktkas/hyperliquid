import * as v from "@valibot/valibot";
import { BorrowLendReserveStateRequest, BorrowLendReserveStateResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "borrowLendReserveState",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.borrowLendReserveState({ token: 0 }),
    ]);
    schemaCoverage(BorrowLendReserveStateResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "borrowLendReserveState",
      "--token=0",
    ]);
    v.parse(BorrowLendReserveStateRequest, data);
  },
});
