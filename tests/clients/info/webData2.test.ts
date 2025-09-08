import { WebData2 } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("webData2", async (_t, client) => {
    const data = await Promise.all([
        client.webData2({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(WebData2, data, {
        ignoreEmptyArray: [
            "#/properties/leadingVaults",
            "#/properties/twapStates",
        ],
        ignoreBranches: {
            "#/properties/openOrders/items/properties/orderType": [0, 4, 5],
            "#/properties/openOrders/items/properties/tif/union/0": [1, 3, 4],
            "#/properties/agentAddress": [0],
            "#/properties/agentValidUntil": [0],
        },
        ignoreUndefinedTypes: [
            "#/properties/spotState",
            "#/properties/perpsAtOpenInterestCap",
        ],
        ignoreDefinedTypes: [
            "#/properties/spotState/properties/evmEscrows",
            "#/properties/optOutOfSpotDusting",
        ],
    });
});
