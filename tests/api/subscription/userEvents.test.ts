// deno-lint-ignore-file no-import-prefix
import { UserEventsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { formatSize, getAssetData, runTestWithExchange } from "./_t.ts";

runTestWithExchange("userEvents", async (_t, clients) => {
  // —————————— Prepare ——————————

  async function openTwap(asset: string, buy: boolean) {
    const { id, universe, ctx } = await getAssetData(asset);
    const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    await clients.exchange.twapOrder({
      twap: {
        a: id,
        b: buy,
        s: twapSz,
        r: false,
        m: 5,
        t: false,
      },
    });
  }

  // —————————— Test ——————————

  const data = await Promise.all([
    deadline(
      // deno-lint-ignore no-async-promise-executor
      new Promise<UserEventsEvent[]>(async (resolve, reject) => {
        const events: UserEventsEvent[] = [];
        await clients.subs.userEvents({
          user: await getWalletAddress(clients.exchange.wallet),
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

        const twapPromise = openTwap("BTC", true);
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
});
