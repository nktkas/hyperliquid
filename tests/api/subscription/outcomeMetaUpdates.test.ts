import type { OutcomeMetaUpdatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { type JsonSchema, typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/outcomeMetaUpdates.ts", import.meta.url).pathname;
const eventSchema = typeToJsonSchema(sourceFile, "OutcomeMetaUpdatesEvent");
const responseSchema: JsonSchema = { type: "array", items: eventSchema };

runTest({
  name: "outcomeMetaUpdates",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<OutcomeMetaUpdatesEvent>(async (cb) => {
      await client.outcomeMetaUpdates(cb);
    }, 10_000);

    schemaCoverage(responseSchema, [data], [
      "#/array",
    ]);
  },
});
