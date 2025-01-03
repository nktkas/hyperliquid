import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const TOKEN_ID_WITH_GENESIS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_GENESIS = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOYER = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOYER = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOY_GAS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_GAS = "0xeb62eee3685fc4c43992febcd9e75443";

const TOKEN_ID_WITH_DEPLOY_TIME = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_TIME = "0xc4bf3f870c0e9465323c0b6ed28096c2";

Deno.test("tokenDetails", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("TokenDetails");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS });
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'genesis'", async (t) => {
                await t.step("must be an object", async (t) => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS });
                    assertJsonSchema(typeSchema, data);

                    assert(
                        typeof data.genesis === "object" && data.genesis !== null,
                        "'genesis' must be an object",
                    );

                    await t.step("Check key 'existingTokenBalances'", () => {
                        assert(
                            data.genesis!.existingTokenBalances.length > 0,
                            "'existingTokenBalances' must be a non-empty array",
                        );
                        assert(
                            data.genesis!.existingTokenBalances.every(([a, b]) =>
                                typeof a === "number" && typeof b === "string"
                            ),
                            "all elements of 'userGenesisBalances' must be an array of tuples [number, string]",
                        );
                    });

                    await t.step("Check key 'userBalances'", () => {
                        assert(
                            data.genesis!.userBalances.length > 0,
                            "'userBalances' must be a non-empty array",
                        );
                        assert(
                            data.genesis!.userBalances.every(([a, b]) =>
                                typeof a === "string" && typeof b === "string"
                            ),
                            "all elements of 'userBalances' must be an array of tuples [string, string]",
                        );
                    });
                });

                await t.step("must be null", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_GENESIS });
                    assertJsonSchema(typeSchema, data);
                    assert(data.genesis === null);
                });
            });

            await t.step("Check key 'deployer'", async (t) => {
                await t.step("must be a string", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOYER });
                    assertJsonSchema(typeSchema, data);
                    assert(typeof data.deployer === "string");
                });
                await t.step("must be null", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOYER });
                    assertJsonSchema(typeSchema, data);
                    assert(data.deployer === null);
                });
            });

            await t.step("Check key 'deployGas'", async (t) => {
                await t.step("must be a string", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_GAS });
                    assertJsonSchema(typeSchema, data);
                    assert(typeof data.deployGas === "string");
                });
                await t.step("must be null", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_GAS });
                    assertJsonSchema(typeSchema, data);
                    assert(data.deployGas === null);
                });
            });

            await t.step("Check key 'deployTime'", async (t) => {
                await t.step("must be a string", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_TIME });
                    assertJsonSchema(typeSchema, data);
                    assert(typeof data.deployTime === "string");
                });
                await t.step("must be null", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_TIME });
                    assertJsonSchema(typeSchema, data);
                    assert(data.deployTime === null);
                });
            });

            await t.step("Check key 'nonCirculatingUserBalances'", async () => {
                const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS });
                assertJsonSchema(typeSchema, data);
                assert(
                    data.nonCirculatingUserBalances.length > 0,
                    "'nonCirculatingUserBalances' must be a non-empty array",
                );
                assert(
                    data.nonCirculatingUserBalances.every(([a, b]) => typeof a === "string" && typeof b === "string"),
                    "all elements of 'nonCirculatingUserBalances' must be an array of tuples [string, string]",
                );
            });
        },
        ignore: !isMatchToScheme,
    });
});
