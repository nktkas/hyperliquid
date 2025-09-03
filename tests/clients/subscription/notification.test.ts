import { WsNotification } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";
import { BigNumber } from "npm:bignumber.js@9";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { formatSize, getAssetData, runTestWithExchange } from "./_t.ts";

runTestWithExchange("notification", async (_t, clients) => {
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
            new Promise<WsNotification[]>(async (resolve, reject) => {
                const events: WsNotification[] = [];
                await clients.subs.notification({
                    user: await getWalletAddress(clients.exchange.wallet),
                }, async (data) => {
                    try {
                        events.push(data);
                        await twapPromise;
                        resolve(events);
                    } catch (error) {
                        reject(error);
                    }
                });

                const twapPromise = openTwap("SOL", true);
            }),
            20_000,
        ),
    ]);
    schemaCoverage(WsNotification, data.flat());
});
