import { deadline } from "jsr:@std/async@1/deadline";
import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatSize, getAssetData, runTestWithExch } from "./_t.ts";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["notification"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    _t: Deno.TestContext,
    client: {
        subs: SubscriptionClient;
        exch: ExchangeClient;
        info: InfoClient;
    },
) {
    // —————————— Prepare ——————————

    async function openTwap(asset: string, buy: boolean): Promise<void> {
        const { id, universe, ctx } = await getAssetData(asset);
        const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

        await client.exch.twapOrder({
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

    const data = await deadline(
        // deno-lint-ignore no-async-promise-executor
        new Promise<unknown[]>(async (resolve, reject) => {
            const events: unknown[] = [];
            await client.subs.notification({ user: await getWalletAddress(client.exch.wallet) }, async (data) => {
                try {
                    events.push(data);
                    await twapPromise;
                    resolve(events);
                } catch (error) {
                    reject(error);
                }
            });

            const twapPromise = openTwap("ETH", true);
        }),
        20_000,
    );
    schemaCoverage(MethodReturnType, data);
}

runTestWithExch("notification", testFn);
