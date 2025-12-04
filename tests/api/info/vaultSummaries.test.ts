import * as v from "@valibot/valibot";
import { VaultSummariesRequest, VaultSummariesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "vaultSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.vaultSummaries(),
    ]);
    schemaCoverage(VaultSummariesResponse, data, {
      ignoreEmptyArray: ["#"],
      ignorePicklistValues: {
        "#/items/properties/relationship/variant/0/properties/type": ["normal", "child"],
      },
      ignoreBranches: {
        "#/items/properties/relationship": [1],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "vaultSummaries",
    ]);
    v.parse(VaultSummariesRequest, data);
  },
});
