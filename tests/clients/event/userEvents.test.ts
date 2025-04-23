import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, PublicClient, WalletClient, WebSocketTransport, type WsUserEvent } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET_1 = "BTC";
const PERPS_ASSET_2 = "ETH";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<EventClient["userEvents"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userEvents", { sanitizeOps: false, sanitizeResources: false }, async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const publicClient = new PublicClient({ transport });
    const eventClient = new EventClient({ transport });
    const walletClient = new WalletClient({
        wallet: privateKeyToAccount(PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // —————————— Test ——————————

    const data = await deadline<WsUserEvent[]>(
        // deno-lint-ignore no-async-promise-executor
        new Promise(async (resolve, reject) => {
            const events: WsUserEvent[] = [];
            await eventClient.userEvents(
                { user: walletClient.wallet.address },
                async (data) => {
                    try {
                        events.push(data);
                        await new Promise((resolve) => setTimeout(resolve, 10000));
                        await Promise.all([
                            order1Promise,
                            order2Promise,
                            twap1Promise,
                            twap2Promise,
                            twapFill1Promise,
                            twapFill2Promise,
                        ]);
                        resolve(events);
                    } catch (error) {
                        reject(error);
                    }
                },
            );
            const order1Promise = openCloseOrder(publicClient, walletClient, PERPS_ASSET_1, true);
            const order2Promise = openCloseOrder(publicClient, walletClient, PERPS_ASSET_2, false);

            const twap1Promise = openCloseTwap(publicClient, walletClient, PERPS_ASSET_1, true, false);
            const twap2Promise = openCloseTwap(publicClient, walletClient, PERPS_ASSET_2, false, false);

            const twapFill1Promise = openCloseTwap(publicClient, walletClient, PERPS_ASSET_1, true, true);
            const twapFill2Promise = openCloseTwap(publicClient, walletClient, PERPS_ASSET_2, false, true);
        }),
        25_000,
    );

    schemaCoverage(MethodReturnType, data, {
        ignoreBranchesByPath: {
            "#/anyOf": [
                1, // WsUserEventFunding
                2, // WsUserEventLiquidation
                3, // WsUserEventNonUserCancel
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
        },
        ignorePropertiesByPath: [
            "#/anyOf/0/properties/fills/items/properties/liquidation",
        ],
    });

    // —————————— Cleanup ——————————

    await transport.close();
});

async function openCloseOrder(
    publicClient: PublicClient,
    walletClient: WalletClient,
    asset: string,
    buy: boolean,
): Promise<void> {
    const { id, universe, ctx } = await getAssetData(publicClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    await walletClient.order({
        orders: [
            {
                a: id,
                b: buy,
                p: buy ? pxUp : pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: buy ? randomCloid() : undefined,
            },
        ],
        grouping: "na",
    });

    await walletClient.order({
        orders: [{
            a: id,
            b: !buy,
            p: buy ? pxDown : pxUp,
            s: "0", // Full position size
            r: true,
            t: { limit: { tif: "Gtc" } },
            c: buy ? randomCloid() : undefined,
        }],
        grouping: "na",
    });
}
async function openCloseTwap(
    publicClient: PublicClient,
    walletClient: WalletClient,
    asset: string,
    buy: boolean,
    position: boolean,
): Promise<void> {
    const { id, universe, ctx } = await getAssetData(publicClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    const result = await walletClient.twapOrder({
        a: id,
        b: buy,
        s: twapSz,
        r: false,
        m: 5,
        t: false,
    });
    const twapId = result.response.data.status.running.twapId;

    if (position) await new Promise((resolve) => setTimeout(resolve, 5000));

    await walletClient.twapCancel({ a: id, t: twapId });

    if (position) {
        await walletClient.order({
            orders: [{
                a: id,
                b: !buy,
                p: buy ? pxDown : pxUp,
                s: "0", // Full position size
                r: true,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        }).catch(() => undefined);
    }
}
