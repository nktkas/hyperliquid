import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const TOKEN_ID_WITH_GENESIS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_GENESIS = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOYER = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOYER = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOY_GAS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_GAS = "0xeb62eee3685fc4c43992febcd9e75443";

const TOKEN_ID_WITH_DEPLOY_TIME = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_TIME = "0xc4bf3f870c0e9465323c0b6ed28096c2";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["tokenDetails"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("tokenDetails", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_GENESIS });
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'genesis'", async (t) => {
                await t.step("should be an 'object'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["blacklistUsers"] });
                    assert(
                        typeof data.genesis === "object" && data.genesis !== null,
                        "'genesis' should be an 'object'",
                    );
                });
                await t.step("should be 'null'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_GENESIS });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.genesis === null);
                });
            });

            await t.step("Check key 'deployer'", async (t) => {
                await t.step("should be a 'string'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOYER });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["blacklistUsers"] });
                    assert(typeof data.deployer === "string");
                });
                await t.step("should be 'null'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOYER });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.deployer === null);
                });
            });

            await t.step("Check key 'deployGas'", async (t) => {
                await t.step("should be a 'string'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_GAS });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["blacklistUsers"] });
                    assert(typeof data.deployGas === "string");
                });
                await t.step("should be 'null'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_GAS });
                    assertJsonSchema(MethodReturnType, data, {
                        skipMinItemsCheck: ["blacklistUsers", "nonCirculatingUserBalances"],
                    });
                    assert(data.deployGas === null);
                });
            });

            await t.step("Check key 'deployTime'", async (t) => {
                await t.step("should be a 'string'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_TIME });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["blacklistUsers"] });
                    assert(typeof data.deployTime === "string");
                });
                await t.step("should be 'null'", async () => {
                    const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_TIME });
                    assertJsonSchema(MethodReturnType, data);
                    assert(data.deployTime === null);
                });
            });

            await t.step("Check key 'nonCirculatingUserBalances'", async () => {
                const data = await client.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS });
                assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["blacklistUsers"] });
                assert(
                    data.nonCirculatingUserBalances.length > 0,
                    "'nonCirculatingUserBalances' should be a non-empty array",
                );
                assert(
                    data.nonCirculatingUserBalances.every(([a, b]) => typeof a === "string" && typeof b === "string"),
                    "all elements of 'nonCirculatingUserBalances' should be an array of tuples [string, string]",
                );
            });
        },
        ignore: !isMatchToScheme,
    });
});
