import { ExchangeStatusRequest, ExchangeStatusResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "exchangeStatus",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.exchangeStatus(),
    ]);
    schemaCoverage(ExchangeStatusResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "exchangeStatus"]);
    parser(ExchangeStatusRequest)(JSON.parse(data));
  },
});
