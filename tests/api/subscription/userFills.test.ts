import { UserFillsEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

runTest({
  name: "userFills",
  mode: "api",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<UserFillsEvent>(
        async (cb) => {
          await client.userFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, cb);
        },
        10_000,
      ),
    ]);
    schemaCoverage(UserFillsEvent, data.flat(), {
      ignoreDefinedTypes: [
        "#/properties/fills/items/properties/liquidation",
        "#/properties/fills/items/properties/twapId",
        "#/properties/fills/items/properties/cloid",
      ],
      ignoreUndefinedTypes: [
        "#/properties/isSnapshot",
      ],
    });
  },
});
