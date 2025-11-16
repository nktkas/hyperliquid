import { NotificationEvent } from "../../../src/api/subscription/~mod.ts";
import { getWalletAddress } from "../../../src/signing/mod.ts";
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
