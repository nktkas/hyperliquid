import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import BigNumber from "npm:bignumber.js@^9.1.2";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["batchModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("batchModify", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, PERPS_ASSET);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // Check response 'resting' + argument 'expiresAfter'
            walletClient.batchModify({
                modifies: [{
                    oid: await openOrder(walletClient, id, pxDown, sz),
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
            walletClient.batchModify({
                modifies: [{
                    oid: await openOrder(walletClient, id, pxDown, sz),
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
            // Check response 'filled'
            walletClient.batchModify({
                modifies: [{
                    oid: await openOrder(walletClient, id, pxDown, sz),
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
            walletClient.batchModify({
                modifies: [{
                    oid: await openOrder(walletClient, id, pxDown, sz),
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
            walletClient.batchModify({
                modifies: [{
                    oid: await openOrder(walletClient, id, pxDown, sz),
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

        const openOrders = await publicClient.openOrders({ user: account.address });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await walletClient.cancel({ cancels });

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
        });
    }
});

async function openOrder(client: WalletClient, id: number, pxDown: string, sz: string): Promise<number> {
    const orderResp = await client.order({
        orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
        grouping: "na",
    });
    const [order] = orderResp.response.data.statuses;
    return "resting" in order ? order.resting.oid : order.filled.oid;
}
