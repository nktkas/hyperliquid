import * as v from "@valibot/valibot";
import { type L2BookEvent, type L2BookParameters, L2BookRequest } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/l2Book.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "L2BookEvent");
const paramsSchema = valibotToJsonSchema(v.omit(L2BookRequest, ["type"]));

runTest({
  name: "l2Book",
  mode: "api",
  fn: async (_t, client) => {
    const params: L2BookParameters[] = [
      { coin: "BTC" },
      { coin: "BTC", nSigFigs: 2 },
      { coin: "BTC", nSigFigs: 3 },
      { coin: "BTC", nSigFigs: 4 },
      { coin: "BTC", nSigFigs: 5, mantissa: 2 },
      { coin: "BTC", nSigFigs: 5, mantissa: 5 },
      { coin: "BTC", nSigFigs: null, mantissa: null },
    ];

    const data = await collectEventsOverTime<L2BookEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.l2Book(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
