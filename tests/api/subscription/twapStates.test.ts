import { TwapStatesEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTestWithExchange({
  name: "twapStates",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<TwapStatesEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.signers[0] : client.exch.config_.wallet,
      );
      await client.subs.twapStates({ user }, cb);
      await createTWAP(client.exch);
    }, 10_000);
    schemaCoverage(TwapStatesEvent, data, {
      ignorePicklistValues: {
        "#/properties/states/items/items/1/properties/side": ["A"],
      },
    });
  },
});
