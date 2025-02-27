import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { EventClient, PublicClient, WalletClient, WebSocketTransport, type WsWebData2 } from "../../../mod.ts";
import { assertJsonSchema, formatPrice, formatSize, getAssetData, isHex } from "../../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_PERPS_ASSET = Deno.args[1] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (typeof TEST_PERPS_ASSET !== "string") {
    throw new Error(`Expected a string, but got ${typeof TEST_PERPS_ASSET}`);
}

// FIXME: Not an in-depth test
Deno.test("webData2", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsWebData2 = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsWebData2");

    // —————————— Prepare ——————————

    // Create clients
    const transport = new WebSocketTransport({ isTestnet: true, timeout: 20_000 });
    const publicClient = new PublicClient({ transport });
    const eventClient = new EventClient({ transport });
    const walletClient = new WalletClient({
        wallet: privateKeyToAccount(TEST_PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // Get asset data
    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
    const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
    const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
    const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);
    const twapSz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // Create an order
    const openOrder = await walletClient.order({
        orders: [
            {
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            },
        ],
        grouping: "na",
    });
    const [order] = openOrder.response.data.statuses;

    // Create a position
    await walletClient.order({
        orders: [
            {
                a: id,
                b: true,
                p: pxUp,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
            },
        ],
        grouping: "na",
    });

    // Create a twap
    const result = await walletClient.twapOrder({
        a: id,
        b: true,
        s: twapSz,
        r: false,
        m: 5,
        t: false,
    });
    const twapId = result.response.data.status.running.twapId;

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsWebData2>((resolve, reject) => {
                const subscrPromise = eventClient.webData2(
                    { user: walletClient.wallet.address },
                    async (data) => {
                        try {
                            await (await subscrPromise).unsubscribe();
                            resolve(data);
                        } catch (error) {
                            reject(error);
                        }
                    },
                );
            }),
            40_000,
        );
        assertJsonSchema(WsWebData2, data, { skipMinItemsCheck: ["children"] });
    });

    // —————————— Cleanup ——————————

    // Close the order
    await walletClient.cancel({
        cancels: [{ a: id, o: "resting" in order ? order.resting.oid : order.filled.oid }],
    });

    // Close the twap
    await walletClient.twapCancel({ a: id, t: twapId });

    // Close the position
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

    // Close the transport
    await transport.close();
});
