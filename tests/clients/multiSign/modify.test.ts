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

export type MethodReturnType = Awaited<ReturnType<MultiSignClient["modify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("modify", { ignore: !PRIVATE_KEY }, async () => {
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
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // Check response 'success'
            multiSignClient.modify({
                oid: (await openOrder(multiSignClient, id, pxDown, sz)).oid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
            }),
            // Check argument `oid` as cloid
            multiSignClient.modify({
                oid: (await openOrder(multiSignClient, id, pxDown, sz)).cloid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
            }),
            // Check argument 'expiresAfter'
            multiSignClient.modify({
                oid: (await openOrder(multiSignClient, id, pxDown, sz)).oid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                },
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
            // Check argument 't.trigger'
            multiSignClient.modify({
                oid: (await openOrder(multiSignClient, id, pxDown, sz)).oid,
                order: {
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: {
                        trigger: {
                            isMarket: false,
                            tpsl: "tp",
                            triggerPx: pxDown,
                        },
                    },
                },
            }),
        ]);

        schemaCoverage(MethodReturnType, data);
    } finally {
        // —————————— Cleanup ——————————

        const openOrders = await infoClient.openOrders({ user: MULTI_SIGN_ADDRESS });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await multiSignClient.cancel({ cancels });
    }
});

async function openOrder(
    client: ExchangeClient,
    id: number,
    pxDown: string,
    sz: string,
): Promise<{ oid: number; cloid: Hex }> {
    const cloid = randomCloid();
    const orderResp = await client.order({
        orders: [{
            a: id,
            b: true,
            p: pxDown,
            s: sz,
            r: false,
            t: { limit: { tif: "Gtc" } },
            c: cloid,
        }],
        grouping: "na",
    });
    const [order] = orderResp.response.data.statuses;
    return {
        oid: "resting" in order ? order.resting.oid : order.filled.oid,
        cloid: "resting" in order ? order.resting.cloid! : order.filled.cloid!,
    };
}
