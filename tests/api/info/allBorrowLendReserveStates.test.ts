import * as v from "@valibot/valibot";
import { AllBorrowLendReserveStatesRequest, AllBorrowLendReserveStatesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "allBorrowLendReserveStates",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.allBorrowLendReserveStates(),
    ]);
    schemaCoverage(AllBorrowLendReserveStatesResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "allBorrowLendReserveStates",
    ]);
    v.parse(AllBorrowLendReserveStatesRequest, data);
  },
});
