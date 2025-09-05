import { GossipRootIps } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("gossipRootIps", async (_t, client) => {
    const data = await Promise.all([
        client.gossipRootIps(),
    ]);
    schemaCoverage(GossipRootIps, data, {
        ignoreEmptyArray: ["#"],
    });
});
