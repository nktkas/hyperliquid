import * as v from "@valibot/valibot";
import { VaultSummariesRequest, VaultSummariesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "vaultSummaries",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.vaultSummaries(),
    ]);
    schemaCoverage(VaultSummariesResponse, data, [
      "#/array",
    ]);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "vaultSummaries",
    ]);
    v.parse(VaultSummariesRequest, data);
  },
});
