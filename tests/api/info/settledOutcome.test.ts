import { type SettledOutcomeParameters, SettledOutcomeRequest } from "@nktkas/hyperliquid/api/info";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/info/_methods/settledOutcome.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SettledOutcomeResponse");
const paramsSchema = valibotToJsonSchema(v.omit(SettledOutcomeRequest, ["type"]));

runTest({
  name: "settledOutcome",
  codeTestFn: async (_t, client) => {
    const params: SettledOutcomeParameters[] = [
      { outcome: 100 },
      { outcome: 999999999 },
    ];

    const data = await Promise.all(params.map((p) => client.settledOutcome(p)));

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/anyOf/0/properties/spec/properties/sideSpecs/items/properties/token/present",
    ]);
  },
});
