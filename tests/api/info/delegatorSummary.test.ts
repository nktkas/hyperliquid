import { DelegatorSummaryRequest, DelegatorSummaryResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

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
      "--user",
      "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    ]);
    parser(DelegatorSummaryRequest)(JSON.parse(data));
  },
});
