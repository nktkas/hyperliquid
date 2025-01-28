import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport, type WsUserFundings } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// FIXME: Not an in-depth test
Deno.test("userFundings", async (t) => {
    // —————————— Type schema ——————————

    const WsUserFundings = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsUserFundings");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<WsUserFundings>((resolve, reject) => {
                const subscrPromise = client.userFundings(
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
        assertJsonSchema(WsUserFundings, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
