import * as v from "@valibot/valibot";
import { GossipRootIpsRequest, GossipRootIpsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "gossipRootIps",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.gossipRootIps(),
    ]);
    schemaCoverage(GossipRootIpsResponse, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "gossipRootIps",
    ]);
    v.parse(GossipRootIpsRequest, data);
  },
});
