import { NotificationEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTestWithExchange({
  name: "notification",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<NotificationEvent>(async (cb) => {
      const user = await getWalletAddress(
        "multiSigUser" in client.exch.config_ ? client.exch.config_.wallet[0] : client.exch.config_.wallet,
      );
      await client.subs.notification({ user }, cb);
      await createTWAP(client.exch);
    }, 10_000);
    schemaCoverage(NotificationEvent, data);
  },
});
