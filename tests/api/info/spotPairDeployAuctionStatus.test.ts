import * as v from "@valibot/valibot";
import { SpotPairDeployAuctionStatusRequest, SpotPairDeployAuctionStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "spotPairDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotPairDeployAuctionStatus(),
    ]);
    schemaCoverage(SpotPairDeployAuctionStatusResponse, data, {
      ignoreNullTypes: ["#/properties/currentGas", "#/properties/endGas"],
      ignoreDefinedTypes: ["#/properties/endGas", "#/properties/currentGas"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "spotPairDeployAuctionStatus",
    ]);
    v.parse(SpotPairDeployAuctionStatusRequest, data);
  },
});
