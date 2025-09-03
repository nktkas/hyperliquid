import { Fill } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userFills", async (_t, client) => {
    const data = await Promise.all([
        client.userFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(v.array(Fill), data, {
        ignoreBranches: {
            "#/items/properties/twapId": [0],
        },
    });
});
