import type { ExplorerTxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/explorerTxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ExplorerTxsEvent");

runTest({
  name: "explorerTxs",
  mode: "rpc",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ExplorerTxsEvent>(async (cb) => {
      await client.explorerTxs(cb);
    }, 10_000);

    schemaCoverage(responseSchema, data, [
      "#/items/properties/error/defined",
    ]);
  },
});
