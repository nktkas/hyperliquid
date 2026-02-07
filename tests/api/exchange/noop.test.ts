import * as v from "@valibot/valibot";
import { NoopRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/noop.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "NoopSuccessResponse");

runTest({
  name: "noop",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.noop(),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "noop",
    ]);
    v.parse(NoopRequest, data);
  },
});
