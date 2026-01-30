import { UserFillsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userFills",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserFillsEvent>(async (cb) => {
      await client.userFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
      await client.userFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, cb);
    }, 10_000);
    schemaCoverage(UserFillsEvent, data, {
      ignoreDefinedTypes: [
        "#/properties/fills/items/intersect/0/properties/twapId",
        "#/properties/fills/items/intersect/0/properties/builderFee",
      ],
      ignoreUndefinedTypes: [
        "#/properties/isSnapshot",
      ],
    });
  },
});
