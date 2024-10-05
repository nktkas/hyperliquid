import { InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

Deno.test(
    "candleSnapshot",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create HyperliquidInfoClient
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("CandleSnapshot");

        // Test
        await t.step("coin + interval + startTime", async (t) => {
            await t.step("interval === 1m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 3m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "3m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 5m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "5m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 15m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "15m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 30m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "30m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 2h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "2h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 4h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "4h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 8h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "8h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 12h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "12h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1d", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1d",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 3d", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "3d",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1w", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1w",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1M", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1M",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

        await t.step("coin + interval + startTime + endTime", async (t) => {
            await t.step("interval === 1m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 3m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "3m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 5m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "5m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 15m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "15m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 30m", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "30m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 2h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "2h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 4h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "4h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 8h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "8h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 12h", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "12h",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1d", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1d",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 3d", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "3d",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1w", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1w",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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

            await t.step("interval === 1M", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "1M",
                    startTime: Date.now() - 1000 * 60 * 60 * 24 * 1,
                    endTime: Date.now(),
                });

                assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
                data.forEach((item) => assertJsonSchema(schema, item));

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
