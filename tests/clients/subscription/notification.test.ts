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
    type WsNotification,
} from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["notification"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("notification", { ignore: !PRIVATE_KEY }, async () => {
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

    const data = await deadline<WsNotification[]>(
        // deno-lint-ignore no-async-promise-executor
        new Promise(async (resolve, reject) => {
            const events: WsNotification[] = [];
            await subsClient.notification(
                { user: exchClient.wallet.address },
                async (data) => {
                    try {
                        events.push(data);
                        await twapFillPromise;
                        resolve(events);
                    } catch (error) {
                        reject(error);
                    }
                },
            );

            const twapFillPromise = openCloseTwap(infoClient, exchClient, PERPS_ASSET, true, true);
        }),
        20_000,
    );

    schemaCoverage(MethodReturnType, data);
});

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
