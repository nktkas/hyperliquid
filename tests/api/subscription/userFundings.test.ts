import { UserFundingsEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "userFundings",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<UserFundingsEvent>(
        async (cb) => {
          await client.userFundings({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(UserFundingsEvent, data.flat(), {
      ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
  },
});
