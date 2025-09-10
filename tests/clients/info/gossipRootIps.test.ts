import { GossipRootIps, GossipRootIpsRequest, parser } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "gossipRootIps",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.gossipRootIps(),
        ]);
        schemaCoverage(GossipRootIps, data, {
            ignoreEmptyArray: ["#"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "gossipRootIps"]);
        parser(GossipRootIpsRequest)(JSON.parse(data));
    },
});
