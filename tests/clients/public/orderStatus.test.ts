import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

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

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["orderStatus"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("orderStatus", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async (t) => {
        await t.step("Check key 'status: unknownOid'", async () => {
            const data = await client.orderStatus({ user: USER_ADDRESS, oid: 0 });
            assertJsonSchema(MethodReturnType, data);
            assert(data.status === "unknownOid", `Expected 'status' to be 'unknownOid', got '${data.status}'`);
        });
        await t.step("Check key 'status: order'", async () => {
            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
            assert(data.status === "order", `Expected 'status' to be 'order', got '${data.status}'`);
        });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check keys", async (t) => {
                await t.step("Check key 'order.order'", async (t) => {
                    await t.step("Check key 'side'", async (t) => {
                        await t.step("some should be 'B'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.side === "B",
                                "Expected 'side' to be 'B', got: " + data.order.order.side,
                            );
                        });
                        await t.step("some should be 'A'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_SHORT });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.side === "A",
                                "Expected 'side' to be 'A', got: " + data.order.order.side,
                            );
                        });
                    });

                    // Failed to re-find an order with 'children.length > 0'
                    await t.step({ name: "Check key 'children'", fn: () => {}, ignore: true });

                    await t.step("Check key 'orderType'", async (t) => {
                        // Failed to find an order with 'orderType === Market'
                        await t.step({ name: "some should be 'Market'", fn: () => {}, ignore: true });

                        await t.step("some should be 'Limit'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LIMIT });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.orderType === "Limit",
                                "Expected 'orderType' to be 'Limit', got: " + data.order.order.orderType,
                            );
                        });
                        await t.step("some should be 'Stop Market'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_STOP_MARKET });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.orderType === "Stop Market",
                                "Expected 'orderType' to be 'Stop Market', got: " + data.order.order.orderType,
                            );
                        });
                        await t.step("some should be 'Stop Limit'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_STOP_LIMIT });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.orderType === "Stop Limit",
                                "Expected 'orderType' to be 'Stop Limit', got: " + data.order.order.orderType,
                            );
                        });
                    });

                    await t.step("Check key 'tif'", async (t) => {
                        await t.step("some should be null", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: TIF_NULL });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.tif === null,
                                "Expected 'tif' to be null, got: " + data.order.order.tif,
                            );
                        });
                        await t.step("some should be 'Gtc'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: TIF_GTC });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.tif === "Gtc",
                                "Expected 'tif' to be 'Gtc', got: " + data.order.order.tif,
                            );
                        });

                        await t.step("some should be 'Alo'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: TIF_ALO });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.tif === "Alo",
                                "Expected 'tif' to be 'Alo', got: " + data.order.order.tif,
                            );
                        });

                        // Failed to find an order with 'tif === Ioc'
                        await t.step({ name: "some should be 'Ioc'", fn: () => {}, ignore: true });
                        // Failed to find an order with 'tif === FrontendMarket'
                        await t.step({ name: "some should be 'FrontendMarket'", fn: () => {}, ignore: true });
                        // Failed to find an order with 'tif === LiquidationMarket'
                        await t.step({ name: "some should be 'LiquidationMarket'", fn: () => {}, ignore: true });
                    });

                    await t.step("Check key 'cloid'", async (t) => {
                        await t.step("some should be a 'string'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: ORDER_TYPE_LONG });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                typeof data.order.order.cloid === "string",
                                "Expected 'cloid' to be a string, got: " + data.order.order.cloid,
                            );
                        });
                        await t.step("some should be 'null'", async () => {
                            const data = await client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID });
                            assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                            assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                            assert(
                                data.order.order.cloid === null,
                                "Expected 'cloid' to be null, got: " + data.order.order.cloid,
                            );
                        });
                    });
                });

                await t.step("Check key 'order.status'", async (t) => {
                    await t.step("some should be 'filled'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_FILLED });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "filled",
                            "Expected 'status' to be 'filled', got: " + data.order.status,
                        );
                    });
                    await t.step("some should be 'open'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_OPEN });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "open",
                            "Expected 'status' to be 'open', got: " + data.order.status,
                        );
                    });
                    await t.step("some should be 'canceled'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_CANCELED });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "canceled",
                            "Expected 'status' to be 'canceled', got: " + data.order.status,
                        );
                    });

                    await t.step("some should be 'rejected'", async () => {
                        const data = await client.orderStatus({ user: USER_ADDRESS, oid: STATUS_REJECTED });
                        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                        assert(data.status === "order", "Expected status to be 'order', got: " + data.status);
                        assert(
                            data.order.status === "rejected",
                            "Expected 'status' to be 'rejected', got: " + data.order.status,
                        );
                    });

                    // Failed to find an order with 'order.status === triggered'
                    await t.step({ name: "some should be 'triggered'", fn: () => {}, ignore: true });
                    // Failed to find an order with 'order.status === marginCanceled'
                    await t.step({ name: "some should be 'marginCanceled'", fn: () => {}, ignore: true });
                });
            });

            await t.step("Check arguments", async (t) => {
                await t.step("Check argument 'oid: number'", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                    assert(data.status === "order", `Expected status to be 'order', got '${data.status}'`);
                    assert(
                        data.order.order.cloid === null,
                        `Expected 'cloid' to be 'null', but got '${data.order.order.cloid}'`,
                    );
                });

                await t.step("Check argument 'oid: hex'", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: CLOID });
                    assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
                    assert(data.status === "order", `Expected status to be 'order', got '${data.status}'`);
                    assert(
                        data.order.order.cloid === CLOID,
                        `Expected 'cloid' to be '${CLOID}', got '${data.order.order.cloid}'`,
                    );
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
