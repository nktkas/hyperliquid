import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { type Candle, EventClient, WebSocketTransport } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("candle", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const Candle = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("Candle");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<Candle>((resolve, reject) => {
                const subscrPromise = client.candle({ coin: "BTC", interval: "1m" }, async (data) => {
                    try {
                        await (await subscrPromise).unsubscribe();
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                });
            }),
            120_000,
        );
        assertJsonSchema(Candle, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
