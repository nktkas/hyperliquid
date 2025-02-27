import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport, type WsAllMids } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("allMids", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsAllMids = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsAllMids");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ isTestnet: true });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsAllMids>((resolve, reject) => {
                const subscrPromise = client.allMids(async (data) => {
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
        assertJsonSchema(WsAllMids, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
