import { UserTwapSliceFillsEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "userTwapSliceFills",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<UserTwapSliceFillsEvent>(
        async (cb) => {
          await client.userTwapSliceFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(UserTwapSliceFillsEvent, data.flat(), {
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
      ignoreDefinedTypes: ["#/properties/twapSliceFills/items/properties/fill/properties/twapId"],
    });
  },
});
