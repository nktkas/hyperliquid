import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { assert } from "jsr:@std/assert@^1.0.10";
import { EventClient, WebSocketTransport, type WsUserTwapSliceFills } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// FIXME: Not an in-depth test
Deno.test("userTwapSliceFills", async (t) => {
    // —————————— Type schema ——————————

    const WsUserTwapSliceFills = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsUserTwapSliceFills");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    const data = await deadline(
        new Promise<WsUserTwapSliceFills>((resolve, reject) => {
            const subscrPromise = client.userTwapSliceFills(
                { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
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

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(WsUserTwapSliceFills, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'side'", async (t) => {
                await t.step("some should be 'B'", () => {
                    assert(data.twapSliceFills.some((twap) => twap.fill.side === "B"));
                });
                await t.step("some should be 'A'", () => {
                    assert(data.twapSliceFills.some((twap) => twap.fill.side === "A"));
                });
            });
        },
        ignore: !isMatchToScheme,
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
