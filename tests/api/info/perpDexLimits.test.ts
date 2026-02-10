import * as v from "@valibot/valibot";
import { type PerpDexLimitsParameters, PerpDexLimitsRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDexLimits.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PerpDexLimitsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(PerpDexLimitsRequest, ["type"]));

runTest({
  name: "perpDexLimits",
  codeTestFn: async (_t, client) => {
    const params: PerpDexLimitsParameters[] = [
      { dex: "" },
      { dex: "vntls" },
    ];

    const data = await Promise.all(params.map((p) => client.perpDexLimits(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
