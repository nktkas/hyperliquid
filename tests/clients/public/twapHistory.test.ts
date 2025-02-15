import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["twapHistory"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("twapHistory", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.twapHistory({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'state.side'", async (t) => {
                await t.step("some should be 'B'", () => {
                    assert(data.some((item) => item.state.side === "B"));
                });
                await t.step("some should be 'A'", () => {
                    assert(data.some((item) => item.state.side === "A"));
                });
            });

            await t.step("Check key 'status.status'", async (t) => {
                await t.step("some should be 'finished'", () => {
                    assert(data.some((item) => item.status.status === "finished"));
                });
                await t.step("some should be 'activated'", () => {
                    assert(data.some((item) => item.status.status === "activated"));
                });
                await t.step("some should be 'terminated'", () => {
                    assert(data.some((item) => item.status.status === "terminated"));
                });
                await t.step("some should be 'error'", () => {
                    assert(data.some((item) => item.status.status === "error"));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
