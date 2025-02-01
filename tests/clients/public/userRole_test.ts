import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.11";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const ROLE_USER = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const ROLE_AGENT = "0xDF1bC1bA4242a47f2AeC1Cd52F9E24b243107a34";
const ROLE_VAULT = "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f";
const ROLE_SUB_ACCOUNT = "0x22a454d3322060475552e8f922ec0c778b8e5760";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["userRole"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("userRole", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.userRole({ user: ROLE_USER });
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'role'", async (t) => {
                // FIXME: Couldn't find an account with the missing role
                await t.step({ name: "should be 'missing'", fn: async () => {}, ignore: true });
                await t.step("should be 'user'", async () => {
                    const data = await client.userRole({ user: ROLE_USER });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.role === "user", `Role should be 'user', got '${data.role}'`);
                });
                await t.step("should be 'agent'", async () => {
                    const data = await client.userRole({ user: ROLE_AGENT });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.role === "agent", `Role should be 'agent', got '${data.role}'`);
                });
                await t.step("should be 'vault'", async () => {
                    const data = await client.userRole({ user: ROLE_VAULT });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.role === "vault", `Role should be 'vault', got '${data.role}'`);
                });
                await t.step("should be 'subAccount'", async () => {
                    const data = await client.userRole({ user: ROLE_SUB_ACCOUNT });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.role === "subAccount", `Role should be 'subAccount', got '${data.role}'`);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
