import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, PublicClient, WalletClient, WebSocketTransport, type WsUserFills } from "../../../mod.ts";
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
Deno.test("userFills", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsUserFills = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsUserFills");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const publicClient = new PublicClient({ transport });
    const eventClient = new EventClient({ transport });
    const walletClient = new WalletClient({
        wallet: privateKeyToAccount(TEST_PRIVATE_KEY),
        transport,
        isTestnet: true,
    });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsUserFills>((resolve, reject) => {
                const subscrPromise = eventClient.userFills(
                    { user: walletClient.wallet.address },
                    async (data) => {
                        try {
                            await subPromise;
                            await (await subscrPromise).unsubscribe();
                            resolve(data);
                        } catch (error) {
                            reject(error);
                        }
                    },
                );

                // Create and close an position for triggering the event
                // deno-lint-ignore no-async-promise-executor
                const subPromise = new Promise<void>(async (r2, j2) => {
                    try {
                        const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
                        const pxUp = formatPrice(new BigNumber(ctx.markPx).times(1.01), universe.szDecimals);
                        const pxDown = formatPrice(new BigNumber(ctx.markPx).times(0.99), universe.szDecimals);
                        const sz = formatSize(new BigNumber(15).div(ctx.markPx), universe.szDecimals);

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
                    } catch (error) {
                        j2(error);
                    } finally {
                        r2();
                    }
                });
            }),
            15_000,
        );
        assertJsonSchema(WsUserFills, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
