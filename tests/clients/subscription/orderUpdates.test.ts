import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { delay } from "@std/async/delay";
import {
    ExchangeClient,
    type Hex,
    InfoClient,
    type Order,
    type OrderStatus,
    SubscriptionClient,
    WebSocketTransport,
} from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["orderUpdates"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("orderUpdates", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using infoClient = new InfoClient({ transport });
    await using subsClient = new SubscriptionClient({ transport });
    await using exchClient = new ExchangeClient({
        wallet: privateKeyToAccount(PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // —————————— Test ——————————

    const data = await deadline<OrderStatus<Order>[][]>(
        // deno-lint-ignore no-async-promise-executor
        new Promise(async (resolve, reject) => {
            const events: OrderStatus<Order>[][] = [];
            await subsClient.orderUpdates(
                { user: exchClient.wallet.address },
                async (data) => {
                    try {
                        events.push(data);
                        if (events.length === 1) { // Only first event should trigger promise
                            await Promise.all([order1Promise, order2Promise, order3Promise]);
                            await delay(3000);
                            resolve(events);
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
            );

            const order1Promise = createOrder(infoClient, exchClient, PERPS_ASSET, "open_filled");
            const order2Promise = createOrder(infoClient, exchClient, PERPS_ASSET, "open_canceled");
            const order3Promise = createOrder(infoClient, exchClient, PERPS_ASSET, "rejected");
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
            ],
        },
    });
});

async function createOrder(
    infoClient: InfoClient,
    exchClient: ExchangeClient,
    asset: string,
    mode: "open_filled" | "open_canceled" | "rejected",
): Promise<void> {
    const { id, universe, ctx } = await getAssetData(infoClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    if (mode === "open_filled") {
        await exchClient.order({
            orders: [{
                a: id,
                b: true,
                p: pxUp,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }],
            grouping: "na",
        });

        await exchClient.order({
            orders: [{
                a: id,
                b: false,
                p: pxDown,
                s: "0",
                r: true,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }],
            grouping: "na",
        }).catch(() => undefined);
    } else if (mode === "open_canceled") {
        const openOrder = await exchClient.order({
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
        await exchClient.cancel({
            cancels: [{
                a: id,
                o: "resting" in order ? order.resting.oid : order.filled.oid,
            }],
        });
    } else if (mode === "rejected") {
        await exchClient.order({
            orders: [{
                a: id,
                b: false,
                p: pxDown,
                s: "0",
                r: true,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        }).catch(() => undefined);
    }
}
