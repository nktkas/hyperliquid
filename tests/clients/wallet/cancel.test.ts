import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData } from "../../_utils/utils.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["cancel"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("cancel", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, PERPS_ASSET);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check response 'success'
        (async () => {
            // Preparing order
            await walletClient.updateLeverage({ asset: id, isCross: true, leverage: 3 });
            const openOrderRes = await walletClient.order({
                orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            });
            const [order] = openOrderRes.response.data.statuses;

            // Cancel order
            return await walletClient.cancel({
                cancels: [{
                    a: id,
                    o: "resting" in order ? order.resting.oid : order.filled.oid,
                }],
            });
        })(),
        // Check argument 'expiresAfter'
        (async () => {
            // Preparing order
            await walletClient.updateLeverage({ asset: id, isCross: true, leverage: 3 });
            const openOrderRes = await walletClient.order({
                orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            });
            const [order] = openOrderRes.response.data.statuses;

            // Cancel order
            return await walletClient.cancel({
                cancels: [{
                    a: id,
                    o: "resting" in order ? order.resting.oid : order.filled.oid,
                }],
                expiresAfter: Date.now() + 1000 * 60 * 60,
            });
        })(),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreBranchesByPath: {
            "#/properties/response/properties/data/properties/statuses/items/anyOf": [0], // error
        },
    });
});
