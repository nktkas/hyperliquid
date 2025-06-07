import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { type ExchangeClient, type Hex, HttpTransport, InfoClient } from "../../../mod.ts";
import { MultiSignClient } from "../../../src/clients/multiSign.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const MULTI_SIGN_ADDRESS = "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83"; // Replace with your MultiSign address
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<MultiSignClient["cancelByCloid"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("cancelByCloid", { ignore: !PRIVATE_KEY }, async () => {
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
    const sz = formatSize(new BigNumber(11).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check response 'success'
        multiSignClient.cancelByCloid({
            cancels: [{
                asset: id,
                cloid: await openOrder(multiSignClient, id, pxDown, sz),
            }],
        }),
        // Check argument 'expiresAfter'
        multiSignClient.cancelByCloid({
            cancels: [{
                asset: id,
                cloid: await openOrder(multiSignClient, id, pxDown, sz),
            }],
            expiresAfter: Date.now() + 1000 * 60 * 60,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});

async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string): Promise<Hex> {
    await client.updateLeverage({ asset: id, isCross: true, leverage: 3 });
    const openOrderRes = await client.order({
        orders: [{
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
            c: randomCloid(),
        }],
        grouping: "na",
    });
    const [order] = openOrderRes.response.data.statuses;
    return "resting" in order ? order.resting.cloid! : order.filled.cloid!;
}
