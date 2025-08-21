import { deadline } from "jsr:@std/async@1/deadline";
import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatSize, getAssetData, runTestWithExch } from "./_t.ts";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["userEvents"]>[1]>[0];
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
            await client.subs.userEvents({ user: await getWalletAddress(client.exch.wallet) }, async (data) => {
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

            const twapPromise = openTwap("ETH", true);
        }),
        20_000,
    );
    schemaCoverage(MethodReturnType, data, {
        ignoreBranchesByPath: {
            "#/anyOf": [
                0, // WsUserEventFill
                1, // WsUserEventFunding
                2, // WsUserEventLiquidation
                3, // WsUserEventNonUserCancel
                5, // WsUserEventTwapSliceFills
            ],
            "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf": [
                1, // TwapStatus.error
            ],
        },
        ignoreEnumValuesByPath: {
            "#/anyOf/4/properties/twapHistory/items/properties/status/anyOf/0/properties/status": [
                "finished",
                "terminated",
            ],
            "#/anyOf/4/properties/twapHistory/items/properties/state/properties/side": ["A"],
        },
    });
}

runTestWithExch("userEvents", testFn);
