// deno-lint-ignore-file no-import-prefix
import { UserEventsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { createTWAP, runTestWithExchange } from "./_t.ts";

runTestWithExchange({
  name: "userEvents",
  fn: async (_t, client) => {
    const data = await Promise.all([
      deadline(
        // deno-lint-ignore no-async-promise-executor
        new Promise<UserEventsEvent[]>(async (resolve, reject) => {
          const events: UserEventsEvent[] = [];
          await client.subs.userEvents({
            user: await getWalletAddress(client.exch.wallet),
          }, async (data) => {
            try {
              events.push(data);
              if (events.length === 1) {
                await twapPromise;
                resolve(events);
              }
            } catch (error) {
              reject(error);
            }
          });

          const twapPromise = createTWAP(client.exch);
        }),
        20_000,
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
