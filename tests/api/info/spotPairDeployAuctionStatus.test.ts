import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/spotPairDeployAuctionStatus.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotPairDeployAuctionStatusResponse");

runTest({
  name: "spotPairDeployAuctionStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([client.spotPairDeployAuctionStatus()]);

    schemaCoverage(responseSchema, data, [
      "#/properties/currentGas/null",
      "#/properties/endGas/defined",
    ]);
  },
});
