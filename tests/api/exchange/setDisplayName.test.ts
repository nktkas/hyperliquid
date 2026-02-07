import * as v from "@valibot/valibot";
import { SetDisplayNameRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/setDisplayName.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SetDisplayNameSuccessResponse");

runTest({
  name: "setDisplayName",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.setDisplayName({ displayName: "" }),
    ]);
    schemaCoverage(typeSchema, data);
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
