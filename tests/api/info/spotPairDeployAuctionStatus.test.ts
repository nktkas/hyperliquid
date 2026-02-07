import * as v from "@valibot/valibot";
import { SpotPairDeployAuctionStatusRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotPairDeployAuctionStatus.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SpotPairDeployAuctionStatusResponse");

runTest({
  name: "spotPairDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.spotPairDeployAuctionStatus(),
    ]);
    schemaCoverage(typeSchema, data, [
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
