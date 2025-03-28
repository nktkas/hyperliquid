import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport, type WsNotification } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("notification", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsNotification = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsNotification");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Just test successful subscription", async () => {
        await client.notification({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, () => {});
    });

    await t.step({
        name: "Matching data to type schema",
        fn: async () => {
            const data = await deadline(
                new Promise<WsNotification>((resolve, reject) => {
                    const subscrPromise = client.notification(
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
            assertJsonSchema(WsNotification, data);
        },
        ignore: true, // FIXME: Event cannot be artificially triggered
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
