import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import BigNumber from "npm:bignumber.js@9";
import { ExchangeClient, type Hex, HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData } from "../../_utils/utils.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { string: ["privateKey"] }) as Args<{ wait?: number; privateKey: Hex }>;

const PRIVATE_KEY = args.privateKey;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["modify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("modify", async () => {
    if (args.wait) await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });
    const infoClient = new InfoClient({ transport });

    const { id, universe, ctx } = await getAssetData(infoClient, PERPS_ASSET);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————

    try {
        const data = await Promise.all([
            // Check response 'success'
            exchClient.modify({
                oid: await openOrder(exchClient, id, pxDown, sz),
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
            exchClient.modify({
                oid: await openOrder(exchClient, id, pxDown, sz),
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
            exchClient.modify({
                oid: await openOrder(exchClient, id, pxDown, sz),
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

        const openOrders = await infoClient.openOrders({ user: account.address });
        const cancels = openOrders.map((o) => ({ a: id, o: o.oid }));
        await exchClient.cancel({ cancels });
    }
});

async function openOrder(client: ExchangeClient, id: number, pxDown: string, sz: string): Promise<number> {
    const openOrderRes = await client.order({
        orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
        grouping: "na",
    });
    const [order] = openOrderRes.response.data.statuses;
    return "resting" in order ? order.resting.oid : order.filled.oid;
}
