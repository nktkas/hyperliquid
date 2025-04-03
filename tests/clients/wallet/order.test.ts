import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";
import { formatPrice, formatSize, getAssetData, randomCloid } from "../../_utils/utils.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const PERPS_ASSET = "BTC";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["order"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("order", async () => {
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
            // Check response 'resting'
            walletClient.order({
                orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            }),
            // Check response 'filled'
            walletClient.order({
                orders: [{ a: id, b: true, p: pxUp, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
            }),
            // Check argument 'builder'
            walletClient.order({
                orders: [{ a: id, b: true, p: pxDown, s: sz, r: false, t: { limit: { tif: "Gtc" } } }],
                grouping: "na",
                builder: { b: account.address, f: 1 },
            }),
            // Check argument 'c'
            walletClient.order({ // resting
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
            walletClient.order({ // filled
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
            // Check argument 'trigger: { tpsl: "tp" }'
            walletClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxUp,
                    s: sz,
                    r: false,
                    t: { trigger: { isMarket: true, triggerPx: pxDown, tpsl: "tp" } },
                }],
                grouping: "na",
            }),
            // Check argument 'trigger: { tpsl: "sl" }'
            walletClient.order({
                orders: [{
                    a: id,
                    b: true,
                    p: pxDown,
                    s: sz,
                    r: false,
                    t: { trigger: { isMarket: true, triggerPx: pxUp, tpsl: "sl" } },
                }],
                grouping: "na",
            }),
        ]);

        schemaCoverage(MethodReturnType, data, {
            ignoreBranchesByPath: {
                "#/properties/response/properties/data/properties/statuses/items/anyOf": [2], // error
            },
        });
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
        }).catch(() => undefined);
    }
});
