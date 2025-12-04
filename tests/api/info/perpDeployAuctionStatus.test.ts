import * as v from "@valibot/valibot";
import { PerpDeployAuctionStatusRequest, PerpDeployAuctionStatusResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "perpDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDeployAuctionStatus(),
    ]);
    schemaCoverage(PerpDeployAuctionStatusResponse, data, {
      ignoreDefinedTypes: ["#/properties/currentGas", "#/properties/endGas"],
      ignoreNullTypes: ["#/properties/endGas", "#/properties/currentGas"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "perpDeployAuctionStatus",
    ]);
    v.parse(PerpDeployAuctionStatusRequest, data);
  },
});
