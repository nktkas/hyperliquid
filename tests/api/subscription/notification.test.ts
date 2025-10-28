import { NotificationEvent } from "@nktkas/hyperliquid/api/subscription";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { collectEventsOverTime, createTWAP, runTestWithExchange } from "./_t.ts";

runTestWithExchange({
  name: "notification",
  fn: async (_t, client) => {
    const data = await Promise.all([
      collectEventsOverTime<NotificationEvent>(
        async (cb) => {
          const user = await getWalletAddress(client.exch.wallet);
          await client.subs.notification({ user }, cb);
          await createTWAP(client.exch);
        },
        10_000,
      ),
    ]);
    schemaCoverage(NotificationEvent, data.flat());
  },
});
