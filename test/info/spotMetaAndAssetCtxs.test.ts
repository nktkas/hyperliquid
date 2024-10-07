import { InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

Deno.test(
    "spotMetaAndAssetCtxs",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SpotMetaAndAssetCtxs");

        // Test
        const data = await client.spotMetaAndAssetCtxs();

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });

        await t.step("[0]", async (t) => {
            await t.step("tokens[].evmContract", async (t) => {
                await t.step("evmContract !== null", () => {
                    assert(
                        data[0].tokens.find((item) => item.evmContract !== null),
                        "'evmContract !== null' failed",
                    );
                });

                await t.step("evmContract === null", () => {
                    assert(
                        data[0].tokens.find((item) => item.evmContract === null),
                        "'evmContract === null' failed",
                    );
                });
            });

            await t.step("tokens[].fullName", async (t) => {
                await t.step("fullName === null", () => {
                    assert(
                        data[0].tokens.find((item) => item.fullName === null),
                        "'fullName === null' failed",
                    );
                });

                await t.step("typeof fullName === string", () => {
                    assert(
                        data[0].tokens.find((item) => typeof item.fullName === "string"),
                        "'typeof fullName === string' failed",
                    );
                });
            });
        });

        await t.step("[1]", async (t) => {
            await t.step("typeof AssetCtx.midPx === string", () => {
                assert(
                    data[1].find((item) => typeof item.midPx === "string"),
                    "'typeof AssetCtx.midPx === string' failed",
                );
            });

            await t.step("AssetCtx.midPx === null", () => {
                assert(
                    data[1].find((item) => item.midPx === null),
                    "'AssetCtx.midPx === null' failed",
                );
            });
        });
    },
);
