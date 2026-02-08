import * as v from "@valibot/valibot";
import { type SetDisplayNameParameters, SetDisplayNameRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

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
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "setDisplayName",
      "--displayName=test",
    ]);
    v.parse(SetDisplayNameRequest, data);
  },
});
