import { type AllMidsEvent, type AllMidsParameters, AllMidsRequest } from "@nktkas/hyperliquid/api/subscription";
import * as v from "@valibot/valibot";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/allMids.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AllMidsEvent");
const paramsSchema = valibotToJsonSchema(v.omit(AllMidsRequest, ["type"]));

runTest({
  name: "allMids",
  mode: "api",
  fn: async (_t, client) => {
    const params: AllMidsParameters[] = [
      {},
      { dex: "unit" },
    ];

    const data = await collectEventsOverTime<AllMidsEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.allMids(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
