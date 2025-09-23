import { AllMidsRequest, AllMidsResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "allMids",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.allMids(),
    ]);
    schemaCoverage(AllMidsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "allMids"]);
    parser(AllMidsRequest)(JSON.parse(data));
  },
});
