import * as v from "@valibot/valibot";
import { type MarginTableParameters, MarginTableRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/marginTable.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "MarginTableResponse");
const paramsSchema = valibotToJsonSchema(v.omit(MarginTableRequest, ["type"]));

runTest({
  name: "marginTable",
  codeTestFn: async (_t, client) => {
    const params: MarginTableParameters[] = [
      { id: 1 },
    ];

    const data = await Promise.all(params.map((p) => client.marginTable(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
