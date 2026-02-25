import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDeployAuctionStatus.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PerpDeployAuctionStatusResponse");

runTest({
  name: "perpDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.perpDeployAuctionStatus()]);

    schemaCoverage(responseSchema, data, [
      "#/properties/currentGas/defined",
      "#/properties/endGas/null",
      "#/properties/currentGas/null",
      "#/properties/endGas/defined",
    ]);
  },
});
