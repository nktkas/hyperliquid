import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["openOrders"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.openOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignoreEnumValuesByPath: {
            "#/properties/orders/items/properties/orderType": ["Market", "Take Profit Limit", "Take Profit Market"],
            "#/properties/orders/items/properties/tif/anyOf/0": ["FrontendMarket", "Ioc", "LiquidationMarket"],
        },
    });
}

runTest("openOrders", testFn, "api");
