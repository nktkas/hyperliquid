import * as v from "@valibot/valibot";
import { MaxMarketOrderNtlsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/maxMarketOrderNtls.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "MaxMarketOrderNtlsResponse");

runTest({
  name: "maxMarketOrderNtls",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.maxMarketOrderNtls(),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "maxMarketOrderNtls",
    ]);
    v.parse(MaxMarketOrderNtlsRequest, data);
  },
});
