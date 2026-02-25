import { type PerpDexStatusParameters, PerpDexStatusRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/perpDexStatus.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "PerpDexStatusResponse");
const paramsSchema = valibotToJsonSchema(v.omit(PerpDexStatusRequest, ["type"]));

runTest({
  name: "perpDexStatus",
  codeTestFn: async (_t, client) => {
    const params: PerpDexStatusParameters[] = [
      { dex: "test" },
    ];

    const data = await Promise.all(params.map((p) => client.perpDexStatus(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
