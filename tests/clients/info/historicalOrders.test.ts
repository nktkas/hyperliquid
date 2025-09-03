import { FrontendOrderStatus } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("historicalOrders", async (_t, client) => {
    const data = await Promise.all([
        client.historicalOrders({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(v.array(FrontendOrderStatus), data, {
        ignoreBranches: {
            "#/items/properties/status": [5, 6, 7, 8, 10, 11, 12, 13, 14],
        },
    });
});
