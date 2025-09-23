import { parser, PerpDexLimitsRequest, PerpDexLimitsResponse } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "perpDexLimits",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.perpDexLimits({ dex: "" }),
      client.perpDexLimits({ dex: "vntls" }),
    ]);
    schemaCoverage(PerpDexLimitsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "perpDexLimits", "--dex", "vntls"]);
    parser(PerpDexLimitsRequest)(JSON.parse(data));
  },
});
