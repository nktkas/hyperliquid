import { type AllMidsParameters, AllMidsRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/allMids.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AllMidsResponse");
const paramsSchema = valibotToJsonSchema(v.omit(AllMidsRequest, ["type"]));

runTest({
  name: "allMids",
  codeTestFn: async (_t, client) => {
    const params: AllMidsParameters[] = [
      {},
      { dex: "gato" },
    ];

    const data = await Promise.all(params.map((p) => client.allMids(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
