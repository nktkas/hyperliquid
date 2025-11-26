import { parser, VaultSummariesRequest, VaultSummariesResponse } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.vaultSummaries(),
    ]);
    schemaCoverage(VaultSummariesResponse, data, {
      ignoreEmptyArray: ["#"],
      ignoreBranches: {
        "#/items/properties/relationship": [1],
        "#/items/properties/relationship/variant/0/properties/type": [1],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "vaultSummaries"]);
    parser(VaultSummariesRequest)(data);
  },
});
