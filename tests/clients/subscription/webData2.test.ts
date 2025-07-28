import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["webData2"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
        }),
        10_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignoreEmptyArrayPaths: [
            "#/properties/leadingVaults",
            "#/properties/twapStates",
        ],
        ignoreEnumValuesByPath: {
            "#/properties/openOrders/items/properties/orderType": [
                "Market",
                "Take Profit Limit",
                "Take Profit Market",
            ],
            "#/properties/openOrders/items/properties/tif/anyOf/0": [
                "FrontendMarket",
                "Ioc",
                "LiquidationMarket",
            ],
        },
        ignoreBranchesByPath: {
            "#/properties/agentAddress/anyOf": [0],
        },
        ignoreTypesByPath: {
            "#/properties/agentValidUntil": ["number"],
        },
        ignorePropertiesByPath: [
            "#/properties/spotState/properties/evmEscrows",
            "#/properties/optOutOfSpotDusting",
        ],
    });
}

runTest("webData2", testFn, "api");
