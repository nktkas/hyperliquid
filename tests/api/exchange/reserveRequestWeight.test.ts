import { type ReserveRequestWeightParameters, ReserveRequestWeightRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/reserveRequestWeight.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ReserveRequestWeightSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(ReserveRequestWeightRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "reserveRequestWeight",
  codeTestFn: async (_t, exchClient) => {
    const params: ReserveRequestWeightParameters[] = [
      { weight: 1 },
    ];

    const data = await Promise.all(params.map((p) => exchClient.reserveRequestWeight(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
