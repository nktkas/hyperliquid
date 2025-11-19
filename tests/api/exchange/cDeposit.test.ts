import { CDepositRequest, CDepositResponse, parser } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest, topUpSpot } from "./_t.ts";

runTest({
  name: "cDeposit",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    await topUpSpot(exchClient, "HYPE", "0.00000001");

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.cDeposit({ wei: 1 }),
    ]);
    schemaCoverage(excludeErrorResponse(CDepositResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "cDeposit", "--wei", "1"]);
    parser(CDepositRequest)(data);
  },
});
