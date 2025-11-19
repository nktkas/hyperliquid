import { parser, Withdraw3Request, Withdraw3Response } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest, topUpPerp } from "./_t.ts";

runTest({
  name: "withdraw3",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    await topUpPerp(exchClient, "2");

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.withdraw3({
        amount: "2",
        destination: "0x0000000000000000000000000000000000000001",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(Withdraw3Response), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "withdraw3",
      "--amount",
      "2",
      "--destination",
      "0x0000000000000000000000000000000000000001",
    ]);
    parser(Withdraw3Request)(data);
  },
});
