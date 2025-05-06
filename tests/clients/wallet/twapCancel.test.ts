import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatSize, getAssetData } from "../../_utils/utils.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["twapCancel"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("twapCancel", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, PERPS_ASSET);
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check response 'success'
        (async () => {
            const twapOrderResult = await walletClient.twapOrder({
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            });
            const twapId = twapOrderResult.response.data.status.running.twapId;
            return await walletClient.twapCancel({ a: id, t: twapId });
        })(),
        // Check argument 'expiresAfter'
        (async () => {
            const twapOrderResult = await walletClient.twapOrder({
                a: id,
                b: true,
                s: sz,
                r: false,
                m: 5,
                t: false,
            });
            const twapId = twapOrderResult.response.data.status.running.twapId;
            return await walletClient.twapCancel({
                a: id,
                t: twapId,
                expiresAfter: Date.now() + 1000 * 60 * 60,
            });
        })(),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreBranchesByPath: {
            "#/properties/response/properties/data/properties/status/anyOf": [0], // error
        },
    });
});
