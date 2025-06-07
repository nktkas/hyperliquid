import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import {
    ExchangeClient,
    type Hex,
    InfoClient,
    SubscriptionClient,
    WebSocketTransport,
    type WsUserEvent,
} from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const PERPS_ASSET_1 = "BTC";
const PERPS_ASSET_2 = "ETH";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["userEvents"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userEvents", { ignore: !PRIVATE_KEY }, async () => {
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

    const data = await deadline<WsUserEvent[]>(
        // deno-lint-ignore no-async-promise-executor
        new Promise(async (resolve, reject) => {
            const events: WsUserEvent[] = [];
            await subsClient.userEvents(
                { user: exchClient.wallet.address },
                async (data) => {
                    try {
                        events.push(data);
                        if (events.length === 1) {
                            await Promise.all([
                                order1Promise,
                                order2Promise,
                                twap1Promise,
                                twap2Promise,
                                twapFill1Promise,
                                twapFill2Promise,
                            ]);
                            resolve(events);
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
            );

            const order1Promise = openCloseOrder(infoClient, exchClient, PERPS_ASSET_1, true);
            const order2Promise = openCloseOrder(infoClient, exchClient, PERPS_ASSET_2, false);

            const twap1Promise = openCloseTwap(infoClient, exchClient, PERPS_ASSET_1, true, false);
            const twap2Promise = openCloseTwap(infoClient, exchClient, PERPS_ASSET_2, false, false);

            const twapFill1Promise = openCloseTwap(infoClient, exchClient, PERPS_ASSET_1, true, true);
            const twapFill2Promise = openCloseTwap(infoClient, exchClient, PERPS_ASSET_2, false, true);
        }),
        20_000,
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
});

async function openCloseOrder(
    infoClient: InfoClient,
    exchClient: ExchangeClient,
    asset: string,
    buy: boolean,
): Promise<void> {
    const { id, universe, ctx } = await getAssetData(infoClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    await exchClient.order({
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

    await exchClient.order({
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
    infoClient: InfoClient,
    exchClient: ExchangeClient,
    asset: string,
    buy: boolean,
    position: boolean,
): Promise<void> {
    const { id, universe, ctx } = await getAssetData(infoClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    const result = await exchClient.twapOrder({
        a: id,
        b: buy,
        s: twapSz,
        r: false,
        m: 5,
        t: false,
    });
    const twapId = result.response.data.status.running.twapId;

    if (position) await new Promise((resolve) => setTimeout(resolve, 3000));

    await exchClient.twapCancel({ a: id, t: twapId });

    if (position) {
        await exchClient.order({
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
