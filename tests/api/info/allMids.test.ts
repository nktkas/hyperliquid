import { AllMidsRequest, AllMidsResponse, parser } from "../../../src/api/info/~mod.ts";
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
    parser(AllMidsRequest)(data);
  },
});
