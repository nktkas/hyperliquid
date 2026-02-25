import { type SetReferrerParameters, SetReferrerRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/setReferrer.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SetReferrerSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(SetReferrerRequest.entries.action.entries), ["type"]));

runTest({
  name: "setReferrer",
  codeTestFn: async (_t, exchClient) => {
    const params: SetReferrerParameters[] = [
      { code: "TEST" },
    ];

    const data = await Promise.all(params.map((p) => exchClient.setReferrer(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
