import { ApproveBuilderFeeRequest, parser, SuccessResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "approveBuilderFee",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.approveBuilderFee({
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
    parser(ApproveBuilderFeeRequest)(data);
  },
});
