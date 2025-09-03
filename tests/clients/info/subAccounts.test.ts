import { SubAccount } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("subAccounts", async (_t, client) => {
    const data = await Promise.all([
        client.subAccounts({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // length > 0
        client.subAccounts({ user: "0x0000000000000000000000000000000000000001" }), // null
    ]);
    schemaCoverage(v.nullable(v.array(SubAccount)), data, {
        ignoreBranches: {
            "#/wrapped/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/leverage":
                [0],
            "#/wrapped/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/liquidationPx":
                [0],
        },
        ignoreDefinedTypes: ["#/wrapped/items/properties/spotState/properties/evmEscrows"],
    });
});
