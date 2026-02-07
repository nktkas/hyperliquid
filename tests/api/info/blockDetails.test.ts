import * as v from "@valibot/valibot";
import { BlockDetailsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/blockDetails.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "BlockDetailsResponse");

runTest({
  name: "blockDetails",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.blockDetails({ height: 300836507 }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "blockDetails",
      "--height=300836507",
    ]);
    v.parse(BlockDetailsRequest, data);
  },
});
