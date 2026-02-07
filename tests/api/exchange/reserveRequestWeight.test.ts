import * as v from "@valibot/valibot";
import { ReserveRequestWeightRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/reserveRequestWeight.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ReserveRequestWeightSuccessResponse");

runTest({
  name: "reserveRequestWeight",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.reserveRequestWeight({ weight: 1 }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "reserveRequestWeight",
      "--weight=1",
    ]);
    v.parse(ReserveRequestWeightRequest, data);
  },
});
