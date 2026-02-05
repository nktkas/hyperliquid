import { UserTwapHistoryEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "userTwapHistory",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserTwapHistoryEvent>(async (cb) => {
      await client.userTwapHistory({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
      await client.userTwapHistory({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
    }, 10_000);
    schemaCoverage(UserTwapHistoryEvent, data, [
      "#/properties/isSnapshot/undefined",
    ]);
  },
});
