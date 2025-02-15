import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, type TxDetails, WebSocketTransport } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = TxDetails[];
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("explorerTxs", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    await t.step("Matching data to type schema", async () => {
        const data = await deadline(
            new Promise<TxDetails[]>((resolve, reject) => {
                const subscrPromise = client.explorerTxs(async (data) => {
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
        assertJsonSchema(MethodReturnType, data);
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
