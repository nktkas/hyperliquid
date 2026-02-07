import * as v from "@valibot/valibot";
import { AlignedQuoteTokenInfoRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/alignedQuoteTokenInfo.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "AlignedQuoteTokenInfoResponse");

runTest({
  name: "alignedQuoteTokenInfo",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.alignedQuoteTokenInfo({ token: 1328 }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "alignedQuoteTokenInfo",
      "--token=1328",
    ]);
    v.parse(AlignedQuoteTokenInfoRequest, data);
  },
});
