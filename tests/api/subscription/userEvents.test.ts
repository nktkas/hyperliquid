import { UserEventsEvent } from "../../../src/api/subscription/~mod.ts";
import { getWalletAddress } from "../../../src/signing/mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";

runTestWithExchange({
  name: "userEvents",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<UserEventsEvent>(
        async (cb) => {
          const user = await getWalletAddress(client.exch.wallet);
          await client.subs.userEvents({ user }, cb);
          await createTWAP(client.exch);
        },
        10_000,
      ),
    ]);
    schemaCoverage(UserEventsEvent, data.flat(), {
      ignoreBranches: {
        "#": [0, 1, 2, 3, 5],
        "#/union/4/properties/twapHistory/items/properties/state/properties/side": [1],
        "#/union/4/properties/twapHistory/items/properties/status/variant/0/properties/status": [0, 2],
        "#/union/4/properties/twapHistory/items/properties/status": [1],
      },
    });
  },
});
