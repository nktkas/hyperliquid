import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";
import type { Hex } from "viem";
import { HyperliquidInfoClient } from "../index.ts";
import { assertJsonSchema, recursiveTraversal } from "./utils.ts";

const TEST_USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const TEST_OID: number = 14737425559;
const TEST_CLOID: Hex = "0x1234567890abcdef1234567890abcdef";

Deno.test("HyperliquidInfoClient", async (t) => {
    // Create HyperliquidInfoClient
    const client = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });

    // Test
    await t.step("allMids", async () => {
        const data = await client.allMids();

        const schema = tsjSchemaGenerator.createSchema("AllMidsResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("openOrders", async () => {
        const data = await client.openOrders({ user: TEST_USER_ADDRESS });

        const schema = tsjSchemaGenerator.createSchema("OpenOrder");
        assert(Array.isArray(data));
        data.forEach((item) => assertJsonSchema(schema, item));

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("frontendOpenOrders", async () => {
        const data = await client.frontendOpenOrders({ user: TEST_USER_ADDRESS });

        const schema = tsjSchemaGenerator.createSchema("FrontendOpenOrder");
        assert(Array.isArray(data));
        data.forEach((item) => assertJsonSchema(schema, item));

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("userFills", async () => {
        const data = await client.userFills({ user: TEST_USER_ADDRESS });

        const schema = tsjSchemaGenerator.createSchema("UserFill");
        assert(Array.isArray(data));
        data.forEach((item) => assertJsonSchema(schema, item));

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("userFillsByTime", async (t) => {
        await t.step("user + startTime", async () => {
            const data = await client.userFillsByTime({
                user: TEST_USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
            });

            const schema = tsjSchemaGenerator.createSchema("UserFill");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });

        await t.step("user + startTime + endTime", async () => {
            const data = await client.userFillsByTime({
                user: TEST_USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
                endTime: Date.now(),
            });

            const schema = tsjSchemaGenerator.createSchema("UserFill");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });
    });

    await t.step("userRateLimit", async () => {
        const data = await client.userRateLimit({ user: TEST_USER_ADDRESS });

        const schema = tsjSchemaGenerator.createSchema("UserRateLimitResponse");
        assertJsonSchema(schema, data);
    });

    await t.step("orderStatus", async (t) => {
        await t.step(`OrderStatusResponse.status === "order"`, async (t) => {
            await t.step("oid", async () => {
                const data = await client.orderStatus({ user: TEST_USER_ADDRESS, oid: TEST_OID });

                const schema = tsjSchemaGenerator.createSchema("OrderStatusResponse");
                assertJsonSchema(schema, data);
                assert(data.status === "order", "Expected status to be 'order'");
            });

            await t.step("cloid", async () => {
                const data = await client.orderStatus({ user: TEST_USER_ADDRESS, oid: TEST_CLOID });

                const schema = tsjSchemaGenerator.createSchema("OrderStatusResponse");
                assertJsonSchema(schema, data);
                assert(data.status === "order", "Expected status to be 'order'");
            });
        });

        await t.step(`OrderStatusResponse.status == "unknownOid"`, async () => {
            const data = await client.orderStatus({ user: TEST_USER_ADDRESS, oid: 0 });

            const schema = tsjSchemaGenerator.createSchema("OrderStatusResponse");
            assertJsonSchema(schema, data);
            assert(data.status === "unknownOid", "Expected status to be 'unknownOid'");
        });
    });

    await t.step("l2Book", async (t) => {
        await t.step("coin", async () => {
            const data = await client.l2Book({ coin: "ETH" });

            const schema = tsjSchemaGenerator.createSchema("L2BookResponse");
            assertJsonSchema(schema, data);

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });

        await t.step("coin + nSigFigs", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });

            const schema = tsjSchemaGenerator.createSchema("L2BookResponse");
            assertJsonSchema(schema, data);

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });

        await t.step("coin + nSigFigs + mantissa", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 });

            const schema = tsjSchemaGenerator.createSchema("L2BookResponse");
            assertJsonSchema(schema, data);

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });
    });

    await t.step("candleSnapshot", async (t) => {
        await t.step("coin + interval + startTime", async () => {
            const data = await client.candleSnapshot({
                coin: "ETH",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
            });

            const schema = tsjSchemaGenerator.createSchema("CandleSnapshot");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });

        await t.step("coin + interval + startTime + endTime", async () => {
            const data = await client.candleSnapshot({
                coin: "ETH",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
                endTime: Date.now(),
            });

            const schema = tsjSchemaGenerator.createSchema("CandleSnapshot");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });
    });

    await t.step("meta", async () => {
        const data = await client.meta();

        const schema = tsjSchemaGenerator.createSchema("MetaResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("metaAndAssetCtxs", async () => {
        const data = await client.metaAndAssetCtxs();

        const schema = tsjSchemaGenerator.createSchema("MetaAndAssetCtxsResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("clearinghouseState", async () => {
        const data = await client.clearinghouseState({ user: TEST_USER_ADDRESS });

        const schema = tsjSchemaGenerator.createSchema("ClearinghouseStateResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("userFunding", async (t) => {
        await t.step("user + startTime", async () => {
            const data = await client.userFunding({
                user: TEST_USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
            });

            const schema = tsjSchemaGenerator.createSchema("UserFunding");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });

        await t.step("user + startTime + endTime", async () => {
            const data = await client.userFunding({
                user: TEST_USER_ADDRESS,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
                endTime: Date.now(),
            });

            const schema = tsjSchemaGenerator.createSchema("UserFunding");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });
    });

    await t.step("fundingHistory", async (t) => {
        await t.step("user + startTime", async () => {
            const data = await client.fundingHistory({
                coin: "ETH",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
            });

            const schema = tsjSchemaGenerator.createSchema("FundingHistory");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });

        await t.step("user + startTime + endTime", async () => {
            const data = await client.fundingHistory({
                coin: "ETH",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
                endTime: Date.now(),
            });

            const schema = tsjSchemaGenerator.createSchema("FundingHistory");
            assert(Array.isArray(data));
            data.forEach((item) => assertJsonSchema(schema, item));

            recursiveTraversal(data, (key, value) => {
                if (Array.isArray(value)) {
                    assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
                }
            });
        });
    });

    await t.step("spotMeta", async () => {
        const data = await client.spotMeta();

        const schema = tsjSchemaGenerator.createSchema("SpotMetaResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("spotMetaAndAssetCtxs", async () => {
        const data = await client.spotMetaAndAssetCtxs();

        const schema = tsjSchemaGenerator.createSchema("SpotMetaAndAssetCtxsResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });

    await t.step("spotClearinghouseState", async () => {
        const data = await client.spotClearinghouseState({ user: TEST_USER_ADDRESS });

        const schema = tsjSchemaGenerator.createSchema("SpotClearinghouseStateResponse");
        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });
    });
});
