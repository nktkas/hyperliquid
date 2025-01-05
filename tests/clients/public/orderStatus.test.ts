import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

const ORDER_TYPE_LONG = 15029784876;
const ORDER_TYPE_SHORT = 15029758931;
const ORDER_TYPE_LIMIT = 15030023260;
const ORDER_TYPE_STOP_MARKET = 15030149356;
const ORDER_TYPE_STOP_LIMIT = 15030701730;

const TIF_NULL = 15030701730;
const TIF_GTC = 15030023260;
const TIF_ALO = 15030054922;

const STATUS_FILLED = 20776436362;
const STATUS_OPEN = 15030023260;
const STATUS_CANCELED = 15548023407;
const STATUS_REJECTED = 20776394366;

const CLOID = "0xa81c445e1ece30c6bbf20c237409700b" as const;
const WITHOUT_CLOID = 15548036277;

Deno.test("orderStatus", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("OrderStatusResult");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
        assertJsonSchema(typeSchema, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check keys", async (t) => {
                await t.step("Check key 'status'", async (t) => {
                    await t.step("must be 'unknownOid'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: 0 });
                        assertJsonSchema(typeSchema, data);
                        assert(data.status === "unknownOid", "Expected status to be 'unknownOid', got: " + data.status);
                    });
                    await t.step("must be 'order'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
                        assertJsonSchema(typeSchema, data);
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                    });
                });

                await t.step("Check key 'order.order'", async (t) => {
                    await t.step("Check key 'side'", async (t) => {
                        await t.step("some must be 'B'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.side === "B",
                                "Expected 'side' to be 'B', got: " + data.order.order.side,
                            );
                        });
                        await t.step("some must be 'A'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_SHORT });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.side === "A",
                                "Expected 'side' to be 'A', got: " + data.order.order.side,
                            );
                        });
                    });

                    // Failed to re-find an order with `children.length > 0`
                    await t.step({ name: "Check key 'children'", fn: () => {}, ignore: true });

                    await t.step("Check key 'orderType'", async (t) => {
                        // Failed to find an order with `orderType === Market`
                        await t.step({ name: "some must be 'Market'", fn: () => {}, ignore: true });

                        await t.step("some must be 'Limit'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LIMIT });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.orderType === "Limit",
                                "Expected 'orderType' to be 'Limit', got: " + data.order.order.orderType,
                            );
                        });
                        await t.step("some must be 'Stop Market'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_STOP_MARKET });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.orderType === "Stop Market",
                                "Expected 'orderType' to be 'Stop Market', got: " + data.order.order.orderType,
                            );
                        });
                        await t.step("some must be 'Stop Limit'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_STOP_LIMIT });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.orderType === "Stop Limit",
                                "Expected 'orderType' to be 'Stop Limit', got: " + data.order.order.orderType,
                            );
                        });
                    });

                    await t.step("Check key 'tif'", async (t) => {
                        await t.step("some must be null", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: TIF_NULL });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.tif === null,
                                "Expected 'tif' to be null, got: " + data.order.order.tif,
                            );
                        });
                        await t.step("some must be 'Gtc'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: TIF_GTC });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.tif === "Gtc",
                                "Expected 'tif' to be 'Gtc', got: " + data.order.order.tif,
                            );
                        });

                        // Failed to find an order with `tif === Ioc`
                        await t.step({ name: "some must be 'Ioc'", fn: () => {}, ignore: true });

                        await t.step("some must be 'Alo'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: TIF_ALO });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.tif === "Alo",
                                "Expected 'tif' to be 'Alo', got: " + data.order.order.tif,
                            );
                        });

                        // Failed to find an order with `tif === FrontendMarket`
                        await t.step({ name: "some must be 'FrontendMarket'", fn: () => {}, ignore: true });

                        // Failed to find an order with `tif === LiquidationMarket`
                        await t.step({ name: "some must be 'LiquidationMarket'", fn: () => {}, ignore: true });
                    });

                    await t.step("Check key 'cloid'", async (t) => {
                        await t.step("some must be a string", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                typeof data.order.order.cloid === "string",
                                "Expected 'cloid' to be a string, got: " + data.order.order.cloid,
                            );
                        });
                        await t.step("some must be null", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID });
                            assertJsonSchema(typeSchema, data);
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.cloid === null,
                                "Expected 'cloid' to be null, got: " + data.order.order.cloid,
                            );
                        });
                    });
                });

                await t.step("Check key 'order.status'", async (t) => {
                    await t.step("some must be 'filled'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_FILLED });
                        assertJsonSchema(typeSchema, data);
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "filled",
                            "Expected 'status' to be 'filled', got: " + data.order.status,
                        );
                    });
                    await t.step("some must be 'open'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_OPEN });
                        assertJsonSchema(typeSchema, data);
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "open",
                            "Expected 'status' to be 'open', got: " + data.order.status,
                        );
                    });
                    await t.step("some must be 'canceled'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_CANCELED });
                        assertJsonSchema(typeSchema, data);
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "canceled",
                            "Expected 'status' to be 'canceled', got: " + data.order.status,
                        );
                    });

                    // Failed to find an order with `order.status === triggered`
                    await t.step({ name: "some must be 'triggered'", fn: () => {}, ignore: true });

                    await t.step("some must be 'rejected'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_REJECTED });
                        assertJsonSchema(typeSchema, data);
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "rejected",
                            "Expected 'status' to be 'rejected', got: " + data.order.status,
                        );
                    });

                    // Failed to find an order with `order.status === marginCanceled`
                    await t.step({ name: "some must be 'marginCanceled'", fn: () => {}, ignore: true });
                });
            });
            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'oid === oid'", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID });
                    assertJsonSchema(typeSchema, data);
                    assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                    assert(
                        data.order.order.cloid === null,
                        "Expected 'cloid' to be null, but got: " + data.order.order.cloid,
                    );
                });

                await t.step("Check argument 'oid === cloid'", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: CLOID });
                    assertJsonSchema(typeSchema, data);
                    assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                    assert(
                        data.order.order.cloid === CLOID,
                        `Expected 'cloid' to be ${CLOID}, got: ${data.order.order.cloid}`,
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
