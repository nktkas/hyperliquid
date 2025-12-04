import * as v from "@valibot/valibot";
import { UserDetailsRequest, UserDetailsResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "userDetails",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userDetails({ user: "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83" }),
    ]);
    schemaCoverage(UserDetailsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "userDetails",
      "--user=0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83",
    ]);
    v.parse(UserDetailsRequest, data);
  },
});
