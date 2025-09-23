import { GossipRootIpsRequest, GossipRootIpsResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "gossipRootIps",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.gossipRootIps(),
    ]);
    schemaCoverage(GossipRootIpsResponse, data, {
      ignoreEmptyArray: ["#"],
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "gossipRootIps"]);
    parser(GossipRootIpsRequest)(JSON.parse(data));
  },
});
