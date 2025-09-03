import { DelegatorReward } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("delegatorRewards", async (_t, client) => {
    const data = await Promise.all([
        client.delegatorRewards({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }), // source = delegation
        client.delegatorRewards({ user: "0x3c83a5cae32a05e88ca6a0350edb540194851a76" }), // source = commission
    ]);
    schemaCoverage(v.array(DelegatorReward), data);
});
