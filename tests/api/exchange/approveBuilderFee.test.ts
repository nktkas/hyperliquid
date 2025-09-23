import { ApproveBuilderFeeRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "approveBuilderFee",
  codeTestFn: async (_t, clients) => {
    const data = await Promise.all([
      clients.exchange.approveBuilderFee({
        maxFeeRate: "0.001%",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "approveBuilderFee",
      "--maxFeeRate",
      "0.001%",
      "--builder",
      "0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    parser(ApproveBuilderFeeRequest)(JSON.parse(data));
  },
});
