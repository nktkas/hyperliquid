// deno-lint-ignore-file no-import-prefix
import { NotificationEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { createTWAP, runTestWithExchange } from "./_t.ts";

runTestWithExchange({
  name: "notification",
  fn: async (_t, client) => {
    const data = await Promise.all([
      deadline(
        // deno-lint-ignore no-async-promise-executor
        new Promise<NotificationEvent[]>(async (resolve, reject) => {
          const events: NotificationEvent[] = [];
          await client.subs.notification({
            user: await getWalletAddress(client.exch.wallet),
          }, async (data) => {
            try {
              events.push(data);
              await twapPromise;
              resolve(events);
            } catch (error) {
              reject(error);
            }
          });

          const twapPromise = createTWAP(client.exch);
        }),
        20_000,
      ),
    ]);
    schemaCoverage(NotificationEvent, data.flat());
  },
});
