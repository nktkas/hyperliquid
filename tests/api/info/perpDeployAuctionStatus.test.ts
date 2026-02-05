import * as v from "@valibot/valibot";
import { PerpDeployAuctionStatusRequest, PerpDeployAuctionStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "perpDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDeployAuctionStatus(),
    ]);
    schemaCoverage(PerpDeployAuctionStatusResponse, data, [
      "#/properties/currentGas/defined",
      "#/properties/endGas/null",
      "#/properties/currentGas/null",
      "#/properties/endGas/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDeployAuctionStatus",
    ]);
    v.parse(PerpDeployAuctionStatusRequest, data);
  },
});
