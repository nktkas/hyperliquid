import * as v from "@valibot/valibot";
import { type DelegatorHistoryParameters, DelegatorHistoryRequest } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/info/_methods/delegatorHistory.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "DelegatorHistoryResponse");
const paramsSchema = valibotToJsonSchema(v.omit(DelegatorHistoryRequest, ["type"]));

runTest({
  name: "delegatorHistory",
  codeTestFn: async (_t, client) => {
    const params: DelegatorHistoryParameters[] = [
      { user: "0xedc88158266c50628a9ffbaa1db2635376577eea" },
    ];

    const data = await Promise.all(params.map((p) => client.delegatorHistory(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
