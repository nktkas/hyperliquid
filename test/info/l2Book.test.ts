import { InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assertGreater } from "jsr:@std/assert@^1.0.4";

Deno.test(
    "l2Book",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("L2Book");

        // Test
        await t.step("coin", async () => {
            const data = await client.l2Book({ coin: "ETH" });

            assertJsonSchema(schema, data);
            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(
                        value.length,
                        0,
                        `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                    );
                }
            });
        });

        await t.step("coin + nSigFigs", async (t) => {
            await t.step("nSigFigs === 2", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("nSigFigs === 3", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 3 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("nSigFigs === 4", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 4 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("nSigFigs === 5", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 5 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });
        });

        await t.step("coin + nSigFigs + mantissa", async (t) => {
            // TODO: "mantissa === 1" causes an error: Status 500 | Body: null
            await t.step({ name: "mantissa === 1", fn: () => {}, ignore: true });

            await t.step("mantissa === 2", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });

            await t.step("mantissa === 5", async () => {
                const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 });

                assertJsonSchema(schema, data);
                recursiveTraversal(data, (key, value) => {
                    if (Array.isArray(value)) {
                        assertGreater(
                            value.length,
                            0,
                            `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                        );
                    }
                });
            });
        });
    },
);
