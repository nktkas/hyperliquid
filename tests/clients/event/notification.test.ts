import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport, type WsNotification } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// FIXME: Failed to get the event
Deno.test.ignore("notification", async (t) => {
    // —————————— Type schema ——————————

    const WsNotification = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsNotification");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsNotification>((resolve, reject) => {
                const subscrPromise = client.notification(
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
        assertJsonSchema(WsNotification, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
