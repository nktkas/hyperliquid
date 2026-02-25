import { type TwapHistoryParameters, TwapHistoryRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/twapHistory.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TwapHistoryResponse");
const paramsSchema = valibotToJsonSchema(v.omit(TwapHistoryRequest, ["type"]));

runTest({
  name: "twapHistory",
  codeTestFn: async (_t, client) => {
    const params: TwapHistoryParameters[] = [
      { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
    ];

    const data = await Promise.all(params.map((p) => client.twapHistory(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
