import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const LONG = { oid: 15029784876, cloid: "0xdd4797ac01135e0dc6b7d163deaff897" } as const;
const SHORT = { oid: 15029758931, cloid: "0x91a7f7c40b23d59dd399b38e219805cb" } as const;
const LIMIT = { oid: 15030023260, cloid: "0xcf4168b64a499def2901f4e12d50f877" } as const;
const STOP_MARKET = { oid: 15030149356, cloid: "0xd4bb069b673a48161bca56cfc88deb6b" } as const;
const STOP_LIMIT = { oid: 15030701730, cloid: "0xa81c445e1ece30c6bbf20c237409700b" } as const;
const GTC = { oid: 15030023260, cloid: "0xcf4168b64a499def2901f4e12d50f877" } as const;
const ALO = { oid: 15030054922, cloid: "0xb7766a15f924a1c1f8fd635f255f36a3" } as const;
const WITHOUT_CLOID = { oid: 15548036277 } as const;

Deno.test("orderStatus", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("OrderStatus");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("Found order", async (t) => {
        await t.step("by oid", async (t) => {
            await t.step("side", async (t) => {
                await t.step("should be B", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "B");
                });

                await t.step("should be A", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: SHORT.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "A");
                });
            });

            // TODO: Couldn't find a 'children' field
            await t.step({ name: "children", fn: () => {}, ignore: true });

            await t.step("orderType", async (t) => {
                // TODO: Couldn't find a `Market` order
                await t.step({ name: "should be Market", fn: () => {}, ignore: true });

                await t.step("should be Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LIMIT.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Limit", data.order.order.orderType);
                });

                await t.step("should be Stop Market", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_MARKET.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Stop Market", data.order.order.orderType);
                });

                await t.step("should be Stop Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_LIMIT.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Stop Limit", data.order.order.orderType);
                });

                // TODO: Couldn't find a `Scale` order
                await t.step({ name: "should be Scale", fn: () => {}, ignore: true });

                // TODO: Couldn't find a `TWAP` order
                await t.step({ name: "should be TWAP", fn: () => {}, ignore: true });
            });

            await t.step("tif", async (t) => {
                await t.step("should be Gtc", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: GTC.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Gtc");
                });

                // TODO: Couldn't find a `Ioc` order
                await t.step({ name: "should be Ioc", fn: async () => {}, ignore: true });

                await t.step("should be Alo", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: ALO.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Alo");
                });
            });

            await t.step("cloid", async (t) => {
                await t.step("should be string", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.cloid);
                });

                await t.step("should be null", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: WITHOUT_CLOID.oid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(!data.order.order.cloid);
                });
            });
        });

        await t.step("by cloid", async (t) => {
            await t.step("side", async (t) => {
                await t.step("should be B", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LONG.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "B");
                });

                await t.step("should be A", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: SHORT.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.side === "A");
                });
            });

            // TODO: Couldn't find a 'children' field
            await t.step({ name: "children", fn: () => {}, ignore: true });

            await t.step("orderType", async (t) => {
                // TODO: Couldn't find a `Market` order
                await t.step({ name: "should be Market", fn: () => {}, ignore: true });

                await t.step("should be Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: LIMIT.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Limit");
                });

                await t.step("should be Stop Market", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_MARKET.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Stop Market", data.order.order.orderType);
                });

                await t.step("should be Stop Limit", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: STOP_LIMIT.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.orderType === "Stop Limit", data.order.order.orderType);
                });

                // TODO: Couldn't find a `Scale` order
                await t.step({ name: "should be Scale", fn: () => {}, ignore: true });

                // TODO: Couldn't find a `TWAP` order
                await t.step({ name: "should be TWAP", fn: () => {}, ignore: true });
            });

            await t.step("tif", async (t) => {
                await t.step("should be Gtc", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: GTC.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Gtc");
                });

                // TODO: Couldn't find a `Ioc` order
                await t.step({ name: "should be Ioc", fn: async () => {}, ignore: true });

                await t.step("should be Alo", async () => {
                    const data = await client.orderStatus({ user: USER_ADDRESS, oid: ALO.cloid });

                    assertJsonSchema(schema, data);
                    assert(data.status === "order", "Expected status to be 'order'");
                    assert(data.order.order.tif === "Alo");
                });
            });
        });
    });

    await t.step("Unknown order", async () => {
        const data = await client.orderStatus({ user: USER_ADDRESS, oid: 0 });

        assertJsonSchema(schema, data);
        assert(data.status === "unknownOid", "Expected status to be 'unknownOid'");
    });
});
