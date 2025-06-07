import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { type Hex, HttpTransport, InfoClient } from "../../../mod.ts";
import { MultiSignClient } from "../../../src/clients/multiSign.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, getAssetData } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const MULTI_SIGN_ADDRESS = "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83";
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<MultiSignClient["updateLeverage"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("updateLeverage", { ignore: !PRIVATE_KEY }, async () => {
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
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);

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

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check argument 'isCross' + argument 'expiresAfter'
        multiSignClient.updateLeverage({ asset: id, isCross: true, leverage: 1 }),
        multiSignClient.updateLeverage({
            asset: id,
            isCross: false,
            leverage: 1,
            expiresAfter: Date.now() + 1000 * 60 * 60,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
