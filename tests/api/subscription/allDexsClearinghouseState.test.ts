import { AllDexsClearinghouseStateEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "allDexsClearinghouseState",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AllDexsClearinghouseStateEvent>(async (cb) => {
      await client.allDexsClearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(AllDexsClearinghouseStateEvent, data);
  },
});
