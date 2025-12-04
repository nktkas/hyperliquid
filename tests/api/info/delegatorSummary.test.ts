import * as v from "@valibot/valibot";
import { DelegatorSummaryRequest, DelegatorSummaryResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "delegatorSummary",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.delegatorSummary({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
    ]);
    schemaCoverage(DelegatorSummaryResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "delegatorSummary",
      "--user=0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    v.parse(DelegatorSummaryRequest, data);
  },
});
