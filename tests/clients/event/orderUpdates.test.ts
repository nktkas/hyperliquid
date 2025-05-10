import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { delay } from "@std/async/delay";
import {
    EventClient,
    type Order,
    type OrderStatus,
    PublicClient,
    WalletClient,
    WebSocketTransport,
} from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<EventClient["orderUpdates"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("orderUpdates", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using publicClient = new PublicClient({ transport });
    await using eventClient = new EventClient({ transport });
    await using walletClient = new WalletClient({
        wallet: privateKeyToAccount(PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // —————————— Test ——————————

    const data = await deadline<OrderStatus<Order>[][]>(
        // deno-lint-ignore no-async-promise-executor
        new Promise(async (resolve, reject) => {
            const events: OrderStatus<Order>[][] = [];
            await eventClient.orderUpdates(
                { user: walletClient.wallet.address },
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

            const order1Promise = createOrder(publicClient, walletClient, PERPS_ASSET, "open_filled");
            const order2Promise = createOrder(publicClient, walletClient, PERPS_ASSET, "open_canceled");
            const order3Promise = createOrder(publicClient, walletClient, PERPS_ASSET, "rejected");
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
            ],
        },
    });
});

async function createOrder(
    publicClient: PublicClient,
    walletClient: WalletClient,
    asset: string,
    mode: "open_filled" | "open_canceled" | "rejected",
): Promise<void> {
    const { id, universe, ctx } = await getAssetData(publicClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    if (mode === "open_filled") {
        await walletClient.order({
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

        await walletClient.order({
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
        const openOrder = await walletClient.order({
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
        await walletClient.cancel({
            cancels: [{
                a: id,
                o: "resting" in order ? order.resting.oid : order.filled.oid,
            }],
        });
    } else if (mode === "rejected") {
        await walletClient.order({
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
