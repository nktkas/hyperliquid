import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport, type WsActiveAssetData } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("activeAssetData", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsActiveAssetData = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsActiveAssetData");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsActiveAssetData>((resolve, reject) => {
                const subscrPromise = client.activeAssetData(
                    { coin: "GALA", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
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
            15_000,
        );
        assertJsonSchema(WsActiveAssetData, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'leverage.type'", async (t) => {
                await t.step("Should be 'isolated'", async () => {
                    const data = await deadline(
                        new Promise<WsActiveAssetData>((resolve, reject) => {
                            const subscrPromise = client.activeAssetData(
                                { coin: "GALA", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
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
                        15_000,
                    );
                    assertJsonSchema(WsActiveAssetData, data);
                    assert(data.leverage.type === "isolated", "leverage.type should be 'isolated'");
                });

                await t.step("Should be 'cross'", async () => {
                    const data = await deadline(
                        new Promise<WsActiveAssetData>((resolve, reject) => {
                            const subscrPromise = client.activeAssetData(
                                { coin: "NEAR", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
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
                        15_000,
                    );
                    assertJsonSchema(WsActiveAssetData, data);
                    assert(data.leverage.type === "cross", "leverage.type should be 'cross'");
                });
            });
        },
        ignore: !isMatchToScheme,
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
