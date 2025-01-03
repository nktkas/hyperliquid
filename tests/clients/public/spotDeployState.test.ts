import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const STATES_FULL_NAME_STRING = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";
const STATES_FULL_NAME_NULL = "0xd8cb8d9747f50be8e423c698f9104ee090540961";

const STATES_MAX_SUPPLY_STRING = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";
const STATES_MAX_SUPPLY_NULL = "0xd8cb8d9747f50be8e423c698f9104ee090540961";

Deno.test("spotDeployState", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("SpotDeployState");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.spotDeployState({ user: STATES_FULL_NAME_STRING });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'states'", async (t) => {
                await t.step("Check key 'fullName'", async (t) => {
                    await t.step("some must be a string", async () => {
                        const data = await client.spotDeployState({ user: STATES_FULL_NAME_STRING });
                        assertJsonSchema(typeSchema, data);
                        assert(data.states.some((x) => typeof x.fullName === "string"));
                    });
                    await t.step("some must be null", async () => {
                        const data = await client.spotDeployState({ user: STATES_FULL_NAME_NULL });
                        assertJsonSchema(typeSchema, data);
                        assert(data.states.some((x) => x.fullName === null));
                    });
                });

                await t.step("Check key 'spots'", () => {
                    assert(data.states.some((x) => x.spots.length > 0), "some 'spots' must be a non-empty array");
                });

                await t.step("Check key 'maxSupply'", async (t) => {
                    await t.step("some must be a string", async () => {
                        const data = await client.spotDeployState({ user: STATES_MAX_SUPPLY_STRING });
                        assertJsonSchema(typeSchema, data);
                        assert(data.states.some((x) => typeof x.maxSupply === "string"));
                    });
                    await t.step("some must be null", async () => {
                        const data = await client.spotDeployState({ user: STATES_MAX_SUPPLY_NULL });
                        assertJsonSchema(typeSchema, data);
                        assert(data.states.some((x) => x.maxSupply === null));
                    });
                });

                await t.step("Check key 'userGenesisBalances'", () => {
                    assert(
                        data.states.some((x) => x.userGenesisBalances.length > 0),
                        "some 'userGenesisBalances' must be a non-empty array",
                    );
                    assert(
                        data.states.some((x) =>
                            x.userGenesisBalances.every(([a, b]) => typeof a === "string" && typeof b === "string")
                        ),
                        "all elements of 'existingTokenGenesisBalances' must be an array of tuples [string, string]",
                    );
                });

                await t.step("Check key 'existingTokenGenesisBalances'", () => {
                    assert(
                        data.states.some((x) => x.existingTokenGenesisBalances.length > 0),
                        "some 'existingTokenGenesisBalances' must be a non-empty array",
                    );
                    assert(
                        data.states.some((x) =>
                            x.existingTokenGenesisBalances.every(([a, b]) =>
                                typeof a === "number" && typeof b === "string"
                            )
                        ),
                        "all elements of 'userGenesisBalances' must be an array of tuples [number, string]",
                    );
                });
            });

            // These values depend on the state of the gas auction, it is not possible to intentionally test all variations.
            await t.step({
                name: "Check key 'gasAuction'",
                fn: async (t) => {
                    await t.step("Check key 'currentGas'", async (t) => {
                        await t.step("must be a string", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(typeSchema, data);
                            assert(
                                typeof data.gasAuction.currentGas === "string",
                                "Expected currentGas to be a string, but got: " + typeof data.gasAuction.currentGas,
                            );
                        });

                        await t.step("must be null", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(typeSchema, data);
                            assert(
                                data.gasAuction.currentGas === null,
                                "Expected currentGas to be null, but got: " + typeof data.gasAuction.currentGas,
                            );
                        });
                    });

                    await t.step("Check key 'endGas'", async (t) => {
                        await t.step("must be a string", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(typeSchema, data);
                            assert(
                                typeof data.gasAuction.endGas === "string",
                                "Expected endGas to be a string, but got: " + typeof data.gasAuction.endGas,
                            );
                        });

                        await t.step("must be null", async () => {
                            const data = await client.spotDeployState({
                                user: "0x0000000000000000000000000000000000000000",
                            });
                            assertJsonSchema(typeSchema, data);
                            assert(
                                data.gasAuction.endGas === null,
                                "Expected endGas to be null, but got: " + typeof data.gasAuction.endGas,
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
