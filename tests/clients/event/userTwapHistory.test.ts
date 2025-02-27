import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { assert } from "jsr:@std/assert@^1.0.10";
import { EventClient, WebSocketTransport, type WsUserTwapHistory } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// FIXME: Not an in-depth test
Deno.test("userTwapHistory", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Type schema ——————————

    const WsUserTwapHistory = tsj
        .createGenerator({ path: "./mod.ts", skipTypeCheck: true })
        .createSchema("WsUserTwapHistory");

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ isTestnet: true });
    const client = new EventClient({ transport });

    // —————————— Test ——————————

    const data = await deadline(
        new Promise<WsUserTwapHistory>((resolve, reject) => {
            const subscrPromise = client.userTwapHistory(
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
        assertJsonSchema(WsUserTwapHistory, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'state.side'", async (t) => {
                await t.step("some should be 'B'", () => {
                    assert(data.history.some((item) => item.state.side === "B"));
                });

                await t.step("some should be 'A'", () => {
                    assert(data.history.some((item) => item.state.side === "A"));
                });
            });

            await t.step("Check key 'status.status'", async (t) => {
                await t.step("some should be 'finished'", () => {
                    assert(data.history.some((item) => item.status.status === "finished"));
                });

                await t.step("some should be 'activated'", () => {
                    assert(data.history.some((item) => item.status.status === "activated"));
                });

                await t.step("some should be 'terminated'", () => {
                    assert(data.history.some((item) => item.status.status === "terminated"));
                });

                await t.step("some should be 'error'", () => {
                    assert(data.history.some((item) => item.status.status === "error"));
                });
            });
        },
        ignore: !isMatchToScheme,
    });

    // —————————— Cleanup ——————————

    // Close the transport
    await transport.close();
});
