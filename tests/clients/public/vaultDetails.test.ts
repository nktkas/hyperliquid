import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const INVALID_VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
const VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP = "0x1719884eb866cb12b2287399b15f7db5e7d775ea";
const VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP = "0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0";
const VAULT_ADDRESS_WITH_CHILD_RELATIONSHIP = "0x768484f7e2ebb675c57838366c02ae99ba2a9b08";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["vaultDetails"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultDetails", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async (t) => {
        await t.step("response should be an 'object'", async () => {
            const data = await client.vaultDetails({ vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP });
            assertJsonSchema(MethodReturnType, data);
            assert(typeof data === "object" && data !== null);
        });

        await t.step("response should be 'null'", async () => {
            const data = await client.vaultDetails({ vaultAddress: INVALID_VAULT_ADDRESS });
            // NOTE: tsj does not return a null schema
            // assertJsonSchema(MethodReturnType, data);
            assert(data === null);
        });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check keys", async (t) => {
                const data = await client.vaultDetails({ vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP });
                assertJsonSchema(MethodReturnType, data);
                assert(typeof data === "object" && data !== null);

                await t.step("Check key 'followerState'", async (t) => {
                    await t.step("should be 'null'", () => assert(data.followerState === null));

                    // FIXME: Failed to find a vault with 'followerState !== null'
                    await t.step({ name: "should not be 'null'", fn: () => {}, ignore: true });
                });

                await t.step("Check key 'followers[].user'", async (t) => {
                    await t.step("some should be 'Leader'", () => {
                        assert(data.followers.some(({ user }) => user === "Leader"));
                    });
                    await t.step("some should be 'Hex'", () => {
                        assert(data.followers.some(({ user }) => user.startsWith("0x")));
                    });
                });

                await t.step("Check key 'relationship'", async (t) => {
                    await t.step("should include 'normal'", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                        });
                        assertJsonSchema(MethodReturnType, data);
                        assert(
                            data.relationship.type === "normal",
                            `Expected 'relationship.type' to be 'normal', got '${data.relationship.type}'`,
                        );
                    });
                    await t.step("should include 'parent'", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP,
                        });
                        assertJsonSchema(MethodReturnType, data);
                        assert(
                            data.relationship.type === "parent",
                            `Expected 'relationship.type' to be 'parent', got ${data.relationship.type}`,
                        );
                    });
                    await t.step("should include 'child'", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_CHILD_RELATIONSHIP,
                        });
                        assertJsonSchema(MethodReturnType, data);
                        assert(
                            data.relationship.type === "child",
                            `Expected 'relationship.type' to be 'child', got ${data.relationship.type}`,
                        );
                    });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'user'", async (t) => {
                    await t.step("user: hex", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                            user: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("user: null", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                            user: null,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                    await t.step("user: undefined", async () => {
                        const data = await client.vaultDetails({
                            vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP,
                            user: undefined,
                        });
                        assertJsonSchema(MethodReturnType, data);
                    });
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
