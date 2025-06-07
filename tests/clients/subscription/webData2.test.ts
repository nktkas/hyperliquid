import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { ExchangeClient, type Hex, InfoClient, SubscriptionClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const PERPS_ASSET_1 = "BTC";
const PERPS_ASSET_2 = "ETH";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["webData2"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("webData2", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    // Create clients
    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws", timeout: 20_000 });
    await using infoClient = new InfoClient({ transport });
    await using subsClient = new SubscriptionClient({ transport });
    await using exchClient = new ExchangeClient({
        wallet: privateKeyToAccount(PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // Get asset data
    const {
        id: id1,
        pxUp: pxUp1,
        pxDown: pxDown1,
        sz: sz1,
        twapSz: twapSz1,
    } = await getAssetDataExtended(
        infoClient,
        PERPS_ASSET_1,
    );
    const {
        id: id2,
        pxUp: pxUp2,
        pxDown: pxDown2,
        sz: sz2,
        twapSz: twapSz2,
    } = await getAssetDataExtended(
        infoClient,
        PERPS_ASSET_2,
    );

    // Update leverage
    await Promise.all([
        exchClient.updateLeverage({ asset: id1, isCross: true, leverage: 5 }),
        exchClient.updateLeverage({ asset: id2, isCross: false, leverage: 5 }),
    ]);

    // Create orders/positions/TWAP's and set up spot dusting opt-out
    const [twap1, twap2] = await Promise.all([
        // Create TWAP orders
        exchClient.twapOrder({ a: id1, b: true, s: twapSz1, r: false, m: 5, t: false }),
        exchClient.twapOrder({ a: id2, b: false, s: twapSz2, r: false, m: 5, t: false }),
        // Create orders
        exchClient.order({
            orders: [{ a: id1, b: true, p: pxDown1, s: sz1, r: false, t: { limit: { tif: "Gtc" } } }],
            grouping: "na",
        }),
        exchClient.order({
            orders: [{ a: id1, b: false, p: pxUp1, s: sz1, r: false, t: { limit: { tif: "Gtc" } } }],
            grouping: "na",
        }),
        exchClient.order({
            orders: [{ a: id1, b: false, p: pxUp1, s: sz1, r: false, t: { limit: { tif: "Alo" } }, c: randomCloid() }],
            grouping: "na",
        }),
        exchClient.order({ // orderType = "Stop Market"
            orders: [{
                a: id1,
                b: false,
                p: pxDown1,
                s: sz1,
                r: false,
                t: { trigger: { isMarket: true, tpsl: "sl", triggerPx: pxDown1 } },
            }],
            grouping: "na",
        }),
        exchClient.order({ // orderType = "Stop Limit"
            orders: [{
                a: id1,
                b: false,
                p: pxDown1,
                s: sz1,
                r: false,
                t: { trigger: { isMarket: false, tpsl: "sl", triggerPx: pxDown1 } },
            }],
            grouping: "na",
        }),
        // Create positions
        exchClient.order({
            orders: [{ a: id1, b: true, p: pxUp1, s: sz1, r: false, t: { limit: { tif: "Gtc" } } }],
            grouping: "na",
        }),
        exchClient.order({
            orders: [{ a: id2, b: false, p: pxDown2, s: sz2, r: false, t: { limit: { tif: "Gtc" } } }],
            grouping: "na",
        }),
        // Change spot dusting opt-out
        exchClient.spotUser({ toggleSpotDusting: { optOut: true } }),
    ]);

    // —————————— Test ——————————

    try {
        const data = await deadline(
            new Promise((resolve) => {
                subsClient.webData2({ user: exchClient.wallet.address }, resolve);
            }),
            10_000,
        );

        schemaCoverage(MethodReturnType, [data], {
            ignoreBranchesByPath: {
                "#/properties/openOrders/items/properties/tif/anyOf": [
                    1, // tif = null
                ],
                "#/properties/agentAddress/anyOf": [
                    1, // agentAddress = null
                ],
            },
            ignoreEmptyArrayPaths: [
                "#/properties/openOrders/items/properties/children",
            ],
            ignoreEnumValuesByPath: {
                "#/properties/openOrders/items/properties/orderType": [
                    "Market",
                    "Take Profit Limit",
                    "Take Profit Market",
                ],
                "#/properties/openOrders/items/properties/tif/anyOf/0": ["FrontendMarket", "Ioc", "LiquidationMarket"],
            },
            ignoreTypesByPath: {
                "#/properties/agentValidUntil": ["null"], // related to agentAddress
            },
            ignorePropertiesByPath: [
                "#/properties/perpsAtOpenInterestCap",
                "#/properties/spotState/properties/evmEscrows",
            ],
        });
    } finally {
        // —————————— Cleanup ——————————

        // Close open orders & TWAP's
        const openOrders = await infoClient.openOrders({ user: exchClient.wallet.address });
        const cancels = openOrders.map((o) => ({ a: o.coin === PERPS_ASSET_1 ? id1 : id2, o: o.oid }));
        await Promise.all([
            exchClient.cancel({ cancels }),
            exchClient.twapCancel({ a: id1, t: twap1.response.data.status.running.twapId }),
            exchClient.twapCancel({ a: id2, t: twap2.response.data.status.running.twapId }),
        ]);

        // Close open positions
        await Promise.all([
            exchClient.order({
                orders: [{
                    a: id1,
                    b: false,
                    p: pxDown1,
                    s: "0", // Full position size
                    r: true,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            }),
            exchClient.order({
                orders: [{
                    a: id2,
                    b: true,
                    p: pxUp2,
                    s: "0", // Full position size
                    r: true,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            }),
        ]);

        // Change spot dusting opt-out
        await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
    }
});

async function getAssetDataExtended(infoClient: InfoClient, asset: string): Promise<{
    id: number;
    pxUp: string;
    pxDown: string;
    sz: string;
    twapSz: string;
}> {
    const { id, universe, ctx } = await getAssetData(infoClient, asset);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);
    const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);
    return { id, pxUp, pxDown, sz, twapSz };
}
