import * as v from "@valibot/valibot";
import { LeadingVaultsRequest, LeadingVaultsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "leadingVaults",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.leadingVaults({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
    ]);
    schemaCoverage(LeadingVaultsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "leadingVaults",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(LeadingVaultsRequest, data);
  },
});
