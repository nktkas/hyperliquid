import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { type Hex, HttpTransport, InfoClient } from "../../../mod.ts";
import { MultiSignClient } from "../../../src/clients/multiSign.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const MULTI_SIGN_ADDRESS = "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83";
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<MultiSignClient["updateIsolatedMargin"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("updateIsolatedMargin", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const multiSignClient = new MultiSignClient({
        transport,
        multiSignAddress: MULTI_SIGN_ADDRESS,
        signers: [account],
        isTestnet: true,
    });
    const infoClient = new InfoClient({ transport });

    const { id, universe, ctx } = await getAssetData(infoClient, PERPS_ASSET);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    //Preparing position
    await multiSignClient.order({
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
    await multiSignClient.updateLeverage({ asset: id, isCross: false, leverage: 3 });
    await multiSignClient.order({
        orders: [{
            a: id,
            b: true,
            p: pxUp,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
        }],
        grouping: "na",
    });

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // Check argument 'isBuy' + argument 'expiresAfter'
            multiSignClient.updateIsolatedMargin({ asset: id, isBuy: true, ntli: 1 }),
            multiSignClient.updateIsolatedMargin({
                asset: id,
                isBuy: false,
                ntli: 1,
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
        ]);

        schemaCoverage(MethodReturnType, data);
    } finally {
        // —————————— Cleanup ——————————

        await multiSignClient.order({
            orders: [{
                a: id,
                b: false,
                p: pxDown,
                s: "0", // Full position size
                r: true,
                t: { limit: { tif: "Gtc" } },
            }],
            grouping: "na",
        });
    }
});
