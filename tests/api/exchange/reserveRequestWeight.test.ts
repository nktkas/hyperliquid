import { parser, ReserveRequestWeightRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "reserveRequestWeight",
  codeTestFn: async (_t, clients) => {
    const data = await Promise.all([
      clients.exchange.reserveRequestWeight({ weight: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "reserveRequestWeight", "--weight", "1"]);
    parser(ReserveRequestWeightRequest)(JSON.parse(data));
  },
});
