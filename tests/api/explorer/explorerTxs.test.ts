import type { ExplorerTxsEvent } from "@nktkas/hyperliquid/api/explorer";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { collectEventsOverTime, runSubscriptionTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/explorer/_methods/explorerTxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ExplorerTxsEvent");

runSubscriptionTest({
  name: "explorerTxs",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ExplorerTxsEvent>(async (cb) => {
      await client.explorerTxs(cb);
    }, 10_000);

    schemaCoverage(responseSchema, data, [
      "#/items/properties/error/defined",
    ]);
  },
});
