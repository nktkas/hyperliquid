import { ActiveAssetData } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("activeAssetData", async (_t, client) => {
    const data = await Promise.all([
        client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "BTC" }), // leverage.type = isolated
        client.activeAssetData({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9", coin: "NEAR" }), // leverage.type = cross
    ]);
    schemaCoverage(ActiveAssetData, data);
});
