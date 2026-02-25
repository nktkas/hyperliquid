import * as v from "@valibot/valibot";
import { type PerpAnnotationParameters, PerpAnnotationRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpAnnotation.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PerpAnnotationResponse");
const paramsSchema = valibotToJsonSchema(v.omit(PerpAnnotationRequest, ["type"]));

runTest({
  name: "perpAnnotation",
  codeTestFn: async (_t, client) => {
    const params: PerpAnnotationParameters[] = [
      { coin: "BTC" },
    ];

    const data = await Promise.all(params.map((p) => client.perpAnnotation(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
