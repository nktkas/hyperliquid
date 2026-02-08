import type { ExplorerBlockEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/explorerBlock.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "ExplorerBlockEvent");

runTest({
  name: "explorerBlock",
  mode: "rpc",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ExplorerBlockEvent>(async (cb) => {
      await client.explorerBlock(cb);
    }, 10_000);

    schemaCoverage(responseSchema, data);
  },
});
