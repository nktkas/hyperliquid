import { type SetDisplayNameParameters, SetDisplayNameRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/setDisplayName.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SetDisplayNameSuccessResponse");
const paramsSchema = valibotToJsonSchema(v.omit(v.object(SetDisplayNameRequest.entries.action.entries), ["type"]));

runTest({
  name: "setDisplayName",
  codeTestFn: async (_t, exchClient) => {
    const params: SetDisplayNameParameters[] = [
      { displayName: "" },
    ];

    const data = await Promise.all(params.map((p) => exchClient.setDisplayName(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
