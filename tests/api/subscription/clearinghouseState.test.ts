import { ClearinghouseStateEvent } from "../../../src/api/subscription/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "clearinghouseState",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<ClearinghouseStateEvent>(
        async (cb) => {
          await client.clearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(ClearinghouseStateEvent, data.flat());
  },
});
