import * as v from "@valibot/valibot";
import { type AlignedQuoteTokenInfoParameters, AlignedQuoteTokenInfoRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/alignedQuoteTokenInfo.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AlignedQuoteTokenInfoResponse");
const paramsSchema = valibotToJsonSchema(v.omit(AlignedQuoteTokenInfoRequest, ["type"]));

runTest({
  name: "alignedQuoteTokenInfo",
  codeTestFn: async (_t, client) => {
    const params: AlignedQuoteTokenInfoParameters[] = [
      { token: 1328 },
    ];

    const data = await Promise.all(params.map((p) => client.alignedQuoteTokenInfo(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
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
