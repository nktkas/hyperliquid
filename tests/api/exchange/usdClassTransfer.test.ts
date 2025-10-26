import { parser, SuccessResponse, UsdClassTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "usdClassTransfer",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdClassTransfer({ amount: "1", toPerp: false }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "usdClassTransfer", "--amount", "1", "--toPerp", "false"]);
    parser(UsdClassTransferRequest)(data);
  },
});
