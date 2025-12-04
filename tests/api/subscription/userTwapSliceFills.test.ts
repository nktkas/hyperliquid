import { UserTwapSliceFillsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userTwapSliceFills",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserTwapSliceFillsEvent>(async (cb) => {
      await client.userTwapSliceFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.userTwapSliceFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
    }, 10_000);
    schemaCoverage(UserTwapSliceFillsEvent, data, {
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
      ignoreDefinedTypes: ["#/properties/twapSliceFills/items/properties/fill/properties/twapId"],
    });
  },
});
