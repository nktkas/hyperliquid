import { parser, PerpDexsRequest, PerpDexsResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "perpDexs",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexs(),
    ]);
    schemaCoverage(PerpDexsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "perpDexs"]);
    parser(PerpDexsRequest)(JSON.parse(data));
  },
});
