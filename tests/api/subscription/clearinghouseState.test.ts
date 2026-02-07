import type { ClearinghouseStateEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/clearinghouseState.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ClearinghouseStateEvent");

runTest({
  name: "clearinghouseState",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ClearinghouseStateEvent>(async (cb) => {
      await client.clearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
