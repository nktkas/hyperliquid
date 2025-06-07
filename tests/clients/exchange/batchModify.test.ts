import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { ExchangeClient, type Hex, HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["batchModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("batchModify", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });
    const infoClient = new InfoClient({ transport });

    const { id, universe, ctx } = await getAssetData(infoClient, PERPS_ASSET);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // Check response 'resting' + argument 'expiresAfter'
            exchClient.batchModify({
                modifies: [{
                    oid: (await openOrder(exchClient, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                }],
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
            // Check response 'resting' + `cloid`
            exchClient.batchModify({
                modifies: [{
                    oid: (await openOrder(exchClient, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    },
                }],
            }),
            // Check response 'resting' + argument `oid` as cloid
            exchClient.batchModify({
                modifies: [{
                    oid: (await openOrder(exchClient, id, pxDown, sz)).cloid,
                    order: {
                        a: id,
                        b: true,
                        p: pxDown,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                }],
            }),
            // Check response 'filled'
            exchClient.batchModify({
                modifies: [{
                    oid: (await openOrder(exchClient, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                    },
                }],
            }),
            // Check response 'filled' + `cloid`
            exchClient.batchModify({
                modifies: [{
                    oid: (await openOrder(exchClient, id, pxDown, sz)).oid,
                    order: {
                        a: id,
                        b: true,
                        p: pxUp,
                        s: sz,
                        r: false,
                        t: { limit: { tif: "Gtc" } },
                        c: randomCloid(),
                    },
                }],
            }),
            // Check argument 't.trigger'
            exchClient.batchModify({
                modifies: [{
                    oid: (await openOrder(exchClient, id, pxDown, sz)).oid,
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
                }],
            }),
        ]);

        schemaCoverage(MethodReturnType, data);
    } finally {
        // —————————— Cleanup ——————————

        const openOrders = await infoClient.openOrders({ user: exchClient.wallet.address });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await exchClient.cancel({ cancels });

        await exchClient.order({
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
