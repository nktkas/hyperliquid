import { type PerpDexLimitsParameters, PerpDexLimitsRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

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
