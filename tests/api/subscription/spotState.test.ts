import type { SpotStateEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/spotState.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "SpotStateEvent");

runTest({
  name: "spotState",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<SpotStateEvent>(async (cb) => {
      await client.spotState({ user: "0x0000000000000000000000000000000000000000" }, cb);
      await client.spotState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.spotState({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.spotState({ user: "0x1defed46db35334232b9f5fd2e5c6180276fb99d" }, cb); // evmEscrows.length > 0
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
