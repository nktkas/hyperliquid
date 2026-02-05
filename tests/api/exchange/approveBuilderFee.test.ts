import * as v from "@valibot/valibot";
import { ApproveBuilderFeeRequest, ApproveBuilderFeeResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "approveBuilderFee",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.approveBuilderFee({
        maxFeeRate: "0.001%",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(ApproveBuilderFeeResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "approveBuilderFee",
      "--maxFeeRate=0.001%",
      "--builder=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(ApproveBuilderFeeRequest, data);
  },
});
