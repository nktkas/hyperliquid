import { type AlignedQuoteTokenInfoParameters, AlignedQuoteTokenInfoRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/alignedQuoteTokenInfo.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AlignedQuoteTokenInfoResponse");
const paramsSchema = valibotToJsonSchema(v.omit(AlignedQuoteTokenInfoRequest, ["type"]));

runTest({
  name: "alignedQuoteTokenInfo",
  // FIXME: API returns 422 error, but the official documentation still lists this API.
  ignore: true,
  codeTestFn: async (_t, client) => {
    const params: AlignedQuoteTokenInfoParameters[] = [
      { token: 1328 },
    ];

    const data = await Promise.all(params.map((p) => client.alignedQuoteTokenInfo(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
