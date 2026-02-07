import type { L2BookEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/l2Book.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "L2BookEvent");

runTest({
  name: "l2Book",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<L2BookEvent>(async (cb) => {
      await client.l2Book({ coin: "BTC" }, cb);
      await client.l2Book({ coin: "BTC", nSigFigs: 2 }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
