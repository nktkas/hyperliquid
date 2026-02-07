import * as v from "@valibot/valibot";
import { PerpDeployAuctionStatusRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDeployAuctionStatus.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "PerpDeployAuctionStatusResponse");

runTest({
  name: "perpDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDeployAuctionStatus(),
    ]);
    schemaCoverage(typeSchema, data, [
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
