import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, getAssetData } from "../../_utils/utils.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["updateLeverage"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("updateLeverage", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, PERPS_ASSET);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);

    await walletClient.order({
        orders: [{
            a: id,
            b: false,
            p: pxDown,
            s: "0", // Full position size
            r: true,
            t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
    }).catch(() => undefined);

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check argument 'isCross'
        walletClient.updateLeverage({ asset: id, isCross: true, leverage: 1 }),
        walletClient.updateLeverage({ asset: id, isCross: false, leverage: 1 }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
