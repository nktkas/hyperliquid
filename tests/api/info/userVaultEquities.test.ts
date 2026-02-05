import * as v from "@valibot/valibot";
import { UserVaultEquitiesRequest, UserVaultEquitiesResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "userVaultEquities",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userVaultEquities({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }),
    ]);
    schemaCoverage(UserVaultEquitiesResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userVaultEquities",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(UserVaultEquitiesRequest, data);
  },
});
