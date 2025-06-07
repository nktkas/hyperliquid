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

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["order"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("order", { ignore: !PRIVATE_KEY }, async () => {
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
            exchClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
                expiresAfter: Date.now() + 1000 * 60 * 60,
            }),
            // Check response 'resting' + `cloid`
            exchClient.order({
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
            }),
            // Check response 'filled'
            exchClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
            }),
            // Check response 'filled' + `cloid`
            exchClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                    c: randomCloid(),
                }],
                grouping: "na",
            }),
            // Check argument 'builder'
            exchClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { limit: { tif: "Gtc" } },
                }],
                grouping: "na",
                builder: { b: exchClient.wallet.address, f: 1 },
            }),
            // Check argument 't.trigger'
            exchClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: {
                        trigger: {
                            isMarket: true,
                            triggerPx: pxDown,
                            tpsl: "tp",
                        },
                    },
                }],
                grouping: "na",
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
