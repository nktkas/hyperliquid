import { FrontendOrder } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("frontendOpenOrders", async (_t, client) => {
    const data = await Promise.all([
        client.frontendOpenOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(v.array(FrontendOrder), data, {
        ignoreBranches: {
            "#/items/properties/orderType": [0, 4, 5],
            "#/items/properties/tif/union/0": [1, 3, 4],
        },
    });
});
