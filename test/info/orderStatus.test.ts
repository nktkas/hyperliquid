import { type Hex, HyperliquidInfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";

interface TestOrder {
    oid: number;
    cloid: Hex;
}

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const LONG: TestOrder = { oid: 15029784876, cloid: "0xdd4797ac01135e0dc6b7d163deaff897" };
const SHORT: TestOrder = { oid: 15029758931, cloid: "0x91a7f7c40b23d59dd399b38e219805cb" };
const LIMIT: TestOrder = { oid: 15030023260, cloid: "0xcf4168b64a499def2901f4e12d50f877" };
const STOP_MARKET: TestOrder = { oid: 15030149356, cloid: "0xd4bb069b673a48161bca56cfc88deb6b" };
const STOP_LIMIT: TestOrder = { oid: 15030701730, cloid: "0xa81c445e1ece30c6bbf20c237409700b" };
const GTC: TestOrder = { oid: 15030023260, cloid: "0xcf4168b64a499def2901f4e12d50f877" };
const ALO: TestOrder = { oid: 15030054922, cloid: "0xb7766a15f924a1c1f8fd635f255f36a3" };

Deno.test("orderStatus", async (t) => {
    // Create HyperliquidInfoClient
    const client = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("OrderStatusResponse");

    // Test
    await t.step(`OrderStatusResponse.status === "order"`, async (t) => {
        await t.step("oid", async (t) => {
            await t.step("side", async (t) => {
                await t.step("B", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "B", "Failed to verify type with 'side' === 'B'");
                });

                await t.step("A", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: SHORT.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "A", "Failed to verify type with 'side' === 'A'");
                });
            });

            await t.step(`cloid !== null`, async () => {
                const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.oid });

                assertJsonSchema(schema, data);
                assert(data.status === "order", "Expected status to be 'order'");
                assert(data.order.order.cloid, "Failed to verify type with 'cloid' !== null");
            });

            await t.step("orderType", async (t) => {
                // TODO
                await t.step({ name: "Market", fn: () => {}, ignore: true });

                await t.step("Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LIMIT.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Limit", "Failed to verify type with 'orderType' === 'Limit'");
                });

                await t.step("Stop Market", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_MARKET.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(
                        data.order.order.orderType === "Stop Market",
                        "Failed to verify type with 'orderType' === 'Stop Market'",
                    );
                });

                await t.step("Stop Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_LIMIT.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(
                        data.order.order.orderType === "Stop Limit",
                        "Failed to verify type with 'orderType' === 'Stop Limit'",
                    );
                });

                // TODO
                await t.step({ name: "Scale", fn: () => {}, ignore: true });

                // TODO
                await t.step({ name: "TWAP", fn: () => {}, ignore: true });
            });

            await t.step("tif", async (t) => {
                await t.step("Gtc", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: GTC.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Gtc", "Failed to verify type with 'tif' === 'Gtc'");
                });

                // TODO
                await t.step({ name: "Ioc", fn: async () => {}, ignore: true });

                await t.step("Alo", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: ALO.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Alo", "Failed to verify type with 'side' === 'Alo'");
                });
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("side", async (t) => {
                await t.step("B", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "B", "Failed to verify type with 'side' === 'B'");
                });

                await t.step("A", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: SHORT.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "A", "Failed to verify type with 'side' === 'A'");
                });
            });

            await t.step(`cloid !== null`, async () => {
                const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.cloid });

                assertJsonSchema(schema, data);
                assert(data.status === "order", "Expected status to be 'order'");
                assert(data.order.order.cloid, "Failed to verify type with 'cloid' !== null");
            });

            await t.step("orderType", async (t) => {
                // TODO
                await t.step({ name: "Market", fn: () => {}, ignore: true });

                await t.step("Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LIMIT.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Limit", "Failed to verify type with 'orderType' === 'Limit'");
                });

                await t.step("Stop Market", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_MARKET.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(
                        data.order.order.orderType === "Stop Market",
                        "Failed to verify type with 'orderType' === 'Stop Market'",
                    );
                });

                await t.step("Stop Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_LIMIT.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(
                        data.order.order.orderType === "Stop Limit",
                        "Failed to verify type with 'orderType' === 'Stop Limit'",
                    );
                });

                // TODO
                await t.step({ name: "Scale", fn: () => {}, ignore: true });

                // TODO
                await t.step({ name: "TWAP", fn: () => {}, ignore: true });
            });

            await t.step("tif", async (t) => {
                await t.step("Gtc", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: GTC.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Gtc", "Failed to verify type with 'tif' === 'Gtc'");
                });

                // TODO
                await t.step({ name: "Ioc", fn: async () => {}, ignore: true });

                await t.step("Alo", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: ALO.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Alo", "Failed to verify type with 'side' === 'Alo'");
                });
            });
        });
    });

    await t.step(`OrderStatusResponse.status == "unknownOid"`, async () => {
        const data = await client.orderStatus({ user: USER_ADDRESS, oid: 0 });

        assertJsonSchema(schema, data);
        assert(data.status === "unknownOid", "Expected status to be 'unknownOid'");
    });
});
