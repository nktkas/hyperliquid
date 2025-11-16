import {
  parser,
  SpotPairDeployAuctionStatusRequest,
  SpotPairDeployAuctionStatusResponse,
} from "../../../src/api/info/~mod.ts";
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
