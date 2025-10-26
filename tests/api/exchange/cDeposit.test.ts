import { CDepositRequest, parser, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest, topUpSpot } from "./_t.ts";

runTest({
  name: "cDeposit",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    await topUpSpot(exchClient, "HYPE", "0.00000001");

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.cDeposit({ wei: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "cDeposit", "--wei", "1"]);
    parser(CDepositRequest)(data);
  },
});
