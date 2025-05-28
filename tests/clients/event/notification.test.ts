import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import {
    PublicClient,
    SubscriptionClient,
    WalletClient,
    WebSocketTransport,
    type WsNotification,
} from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData } from "../../_utils/utils.ts";

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["notification"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("notification", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using publicClient = new PublicClient({ transport });
    await using subsClient = new SubscriptionClient({ transport });
    await using walletClient = new WalletClient({
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
                { user: walletClient.wallet.address },
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

            const twapFillPromise = openCloseTwap(publicClient, walletClient, PERPS_ASSET, true, true);
        }),
        20_000,
    );

    schemaCoverage(MethodReturnType, data);
});

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

    if (position) await new Promise((resolve) => setTimeout(resolve, 3000));

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
