import * as v from "@valibot/valibot";
import { SpotPairDeployAuctionStatusRequest, SpotPairDeployAuctionStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "spotPairDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotPairDeployAuctionStatus(),
    ]);
    schemaCoverage(SpotPairDeployAuctionStatusResponse, data, [
      "#/properties/currentGas/null",
      "#/properties/endGas/defined",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotPairDeployAuctionStatus",
    ]);
    v.parse(SpotPairDeployAuctionStatusRequest, data);
  },
});
