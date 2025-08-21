import { deadline } from "jsr:@std/async@1/deadline";
import { BigNumber } from "npm:bignumber.js@9";
import type { ExchangeClient, InfoClient, SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { formatPrice, formatSize, getAssetData, runTestWithExch } from "./_t.ts";
import { getWalletAddress } from "@nktkas/hyperliquid/signing";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["orderUpdates"]>[1]>[0];
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

    async function openCancelOrder(asset: string): Promise<void> {
        const { id, universe, ctx } = await getAssetData(asset);
        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

        const openOrder = await client.exch.order({
            orders: [{
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        });

        const [order] = openOrder.response.data.statuses;
        await client.exch.cancel({
            cancels: [{
                a: id,
                o: "resting" in order ? order.resting.oid : order.filled.oid,
            }],
        });
    }

    // —————————— Test ——————————

    const data = await deadline(
        // deno-lint-ignore no-async-promise-executor
        new Promise<unknown[]>(async (resolve, reject) => {
            const events: unknown[] = [];
            await client.subs.orderUpdates({ user: await getWalletAddress(client.exch.wallet) }, async (data) => {
                try {
                    events.push(data);
                    if (events.length === 1) { // Only first event should trigger promise
                        await orderPromise;
                        await new Promise((r) => setTimeout(r, 3000));
                        resolve(events);
                    }
                } catch (error) {
                    reject(error);
                }
            });

            const orderPromise = openCancelOrder("ETH");
        }),
        20_000,
    );
    schemaCoverage(MethodReturnType, data, {
        ignoreEnumValuesByPath: {
            "#/items/properties/status": [
                "triggered",
                "delistedCanceled",
                "liquidatedCanceled",
                "marginCanceled",
                "openInterestCapCanceled",
                "reduceOnlyCanceled",
                "scheduledCancel",
                "selfTradeCanceled",
                "siblingFilledCanceled",
                "vaultWithdrawalCanceled",
                "rejected",
                "reduceOnlyRejected",
                "filled",
            ],
            "#/items/properties/order/properties/side": ["A"],
        },
        ignorePropertiesByPath: [
            "#/items/properties/order/properties/cloid",
            "#/items/properties/order/properties/reduceOnly",
        ],
    });
}

runTestWithExch("orderUpdates", testFn);
