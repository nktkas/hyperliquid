import { DelegatorHistoryRequest, DelegatorHistoryResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "delegatorHistory",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.delegatorHistory({ user: "0xedc88158266c50628a9ffbaa1db2635376577eea" }),
    ]);
    schemaCoverage(DelegatorHistoryResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "delegatorHistory",
      "--user",
      "0xedc88158266c50628a9ffbaa1db2635376577eea",
    ]);
    parser(DelegatorHistoryRequest)(JSON.parse(data));
  },
});
