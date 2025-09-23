import {
  parser,
  SpotPairDeployAuctionStatusRequest,
  SpotPairDeployAuctionStatusResponse,
} from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotPairDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotPairDeployAuctionStatus(),
    ]);
    schemaCoverage(SpotPairDeployAuctionStatusResponse, data, {
      ignoreNullTypes: ["#/properties/currentGas"],
      ignoreDefinedTypes: ["#/properties/endGas"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "spotPairDeployAuctionStatus"]);
    parser(SpotPairDeployAuctionStatusRequest)(JSON.parse(data));
  },
});
