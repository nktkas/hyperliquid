import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { assertGreater } from "jsr:@std/assert@^1.0.10";
import { EventClient, WebSocketTransport, type WsTrade } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("trades", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsTrade = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsTrade");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsTrade[]>((resolve, reject) => {
                const subscrPromise = client.trades({ coin: "ETH" }, async (data) => {
                    try {
                        await (await subscrPromise).unsubscribe();
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                });
            }),
            15_000,
        );
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(WsTrade, item));
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
