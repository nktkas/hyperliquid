import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const STATES_FULL_NAME_STRING = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";
const STATES_FULL_NAME_NULL = "0xd8cb8d9747f50be8e423c698f9104ee090540961";

const STATES_MAX_SUPPLY_STRING = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";
const STATES_MAX_SUPPLY_NULL = "0xd8cb8d9747f50be8e423c698f9104ee090540961";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["spotDeployState"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("spotDeployState", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.spotDeployState({ user: STATES_FULL_NAME_STRING });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data, {
            skipMinItemsCheck: ["blacklistUsers"],
        });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'states'", async (t) => {
                await t.step("Check key 'fullName'", async (t) => {
                    await t.step("some should be a 'string'", async () => {
                        const data = await client.spotDeployState({ user: STATES_FULL_NAME_STRING });
                        assertJsonSchema(MethodReturnType, data, {
                            skipMinItemsCheck: ["blacklistUsers"],
                        });
                        assert(data.states.some((x) => typeof x.fullName === "string"));
                    });
                    await t.step("some should be 'null'", async () => {
                        const data = await client.spotDeployState({ user: STATES_FULL_NAME_NULL });
                        assertJsonSchema(MethodReturnType, data, {
                            skipMinItemsCheck: [
                                "spots",
                                "userGenesisBalances",
                                "existingTokenGenesisBalances",
                                "blacklistUsers",
                            ],
                        });
                        assert(data.states.some((x) => x.fullName === null));
                    });
                });

                await t.step("Check key 'maxSupply'", async (t) => {
                    await t.step("some should be a 'string'", async () => {
                        const data = await client.spotDeployState({ user: STATES_MAX_SUPPLY_STRING });
                        assertJsonSchema(MethodReturnType, data, {
                            skipMinItemsCheck: ["blacklistUsers"],
                        });
                        assert(data.states.some((x) => typeof x.maxSupply === "string"));
                    });
                    await t.step("some should be 'null'", async () => {
                        const data = await client.spotDeployState({ user: STATES_MAX_SUPPLY_NULL });
                        assertJsonSchema(MethodReturnType, data, {
                            skipMinItemsCheck: [
                                "spots",
                                "userGenesisBalances",
                                "existingTokenGenesisBalances",
                                "blacklistUsers",
                            ],
                        });
                        assert(data.states.some((x) => x.maxSupply === null));
                    });
                });
            });

            // FIXME:
            // These values depend on the state of the gas auction,
            // it is not possible to intentionally test all variations
            await t.step({
                name: "Check key 'gasAuction'",
                fn: async (t) => {
                    await t.step("Check key 'currentGas'", async (t) => {
                        await t.step("should be a 'string'", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(MethodReturnType, data, {
                                skipMinItemsCheck: ["blacklistUsers"],
                            });
                            assert(
                                typeof data.gasAuction.currentGas === "string",
                                `Expected 'currentGas' to be 'string', got '${typeof data.gasAuction.currentGas}'`,
                            );
                        });

                        await t.step("should be 'null'", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(MethodReturnType, data, {
                                skipMinItemsCheck: ["blacklistUsers"],
                            });
                            assert(
                                data.gasAuction.currentGas === null,
                                `Expected 'currentGas' to be 'null', got '${typeof data.gasAuction.currentGas}'`,
                            );
                        });
                    });

                    await t.step("Check key 'endGas'", async (t) => {
                        await t.step("should be a 'string'", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(MethodReturnType, data, {
                                skipMinItemsCheck: ["blacklistUsers"],
                            });
                            assert(
                                typeof data.gasAuction.endGas === "string",
                                `Expected 'endGas' to be a 'string', got '${typeof data.gasAuction.endGas}'`,
                            );
                        });

                        await t.step("should be 'null'", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(MethodReturnType, data, {
                                skipMinItemsCheck: ["blacklistUsers"],
                            });
                            assert(
                                data.gasAuction.endGas === null,
                                `Expected 'endGas' to be 'null', got '${typeof data.gasAuction.endGas}'`,
                            );
                        });
                    });
                },
                ignore: true,
            });
        },
        ignore: !isMatchToScheme,
    });
});
