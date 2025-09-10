import { DelegatorReward, DelegatorRewardsRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "delegatorRewards",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.delegatorRewards({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }), // source = delegation
            client.delegatorRewards({ user: "0x3c83a5cae32a05e88ca6a0350edb540194851a76" }), // source = commission
        ]);
        schemaCoverage(v.array(DelegatorReward), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "info",
            "delegatorRewards",
            "--user",
            "0xedc88158266c50628a9ffbaa1db2635376577eea",
        ]);
        parser(DelegatorRewardsRequest)(JSON.parse(data));
    },
});
