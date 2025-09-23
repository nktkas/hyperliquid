import { MaxMarketOrderNtlsRequest, MaxMarketOrderNtlsResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "maxMarketOrderNtls",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.maxMarketOrderNtls(),
    ]);
    schemaCoverage(MaxMarketOrderNtlsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "maxMarketOrderNtls"]);
    parser(MaxMarketOrderNtlsRequest)(JSON.parse(data));
  },
});
