import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport, type WsUserEvent } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// FIXME: Failed to get any events
Deno.test.ignore("userEvents", async (t) => {
    // —————————— Type schema ——————————

    const WsUserEvent = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsUserEvent");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsUserEvent>((resolve, reject) => {
                const subscrPromise = client.userEvents(
                    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" },
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
        assertJsonSchema(WsUserEvent, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
