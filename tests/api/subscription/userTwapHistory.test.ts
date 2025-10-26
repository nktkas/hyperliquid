// deno-lint-ignore-file no-import-prefix
import { UserTwapHistoryEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userTwapHistory",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      deadline(
        new Promise<UserTwapHistoryEvent>((resolve) => {
          client.userTwapHistory({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
        }),
        10_000,
      ),
      deadline(
        new Promise<UserTwapHistoryEvent>((resolve) => {
          client.userTwapHistory({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
        }),
        10_000,
      ),
    ]);
    schemaCoverage(UserTwapHistoryEvent, data, {
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
  },
});
