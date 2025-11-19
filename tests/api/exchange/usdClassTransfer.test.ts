import { parser, UsdClassTransferRequest, UsdClassTransferResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "usdClassTransfer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdClassTransfer({ amount: "1", toPerp: false }),
    ]);
    schemaCoverage(excludeErrorResponse(UsdClassTransferResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "usdClassTransfer", "--amount", "1", "--toPerp", "false"]);
    parser(UsdClassTransferRequest)(data);
  },
});
