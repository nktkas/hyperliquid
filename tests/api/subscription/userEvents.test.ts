import { UserEventsEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTestWithExchange({
  name: "userEvents",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<UserEventsEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.wallet[0] : client.exch.config_.wallet,
      );
      await client.subs.userEvents({ user }, cb);
      await createTWAP(client.exch);
    }, 10_000);
    schemaCoverage(UserEventsEvent, data, {
      ignorePicklistValues: {
        "#/union/4/properties/twapHistory/items/properties/state/properties/side": ["A"],
        "#/union/4/properties/twapHistory/items/properties/status/variant/0/properties/status": [
          "finished",
          "terminated",
        ],
      },
      ignoreUndefinedTypes: [
        "#/union/4/properties/twapHistory/items/properties/twapId",
      ],
      ignoreBranches: {
        "#": [0, 1, 2, 3, 5],
        "#/union/4/properties/twapHistory/items/properties/status": [1],
      },
    });
  },
});
