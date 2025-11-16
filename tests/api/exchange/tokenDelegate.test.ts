import { parser, SuccessResponse, TokenDelegateRequest } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest, topUpSpot } from "./_t.ts";

runTest({
  name: "tokenDelegate",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    await topUpSpot(exchClient, "HYPE", "0.00000001");
    await exchClient.cDeposit({ wei: 1 });

    // —————————— Test ——————————

    const data = await Promise.all([
      exchClient.tokenDelegate({
        validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
        wei: 1,
        isUndelegate: false,
      }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "tokenDelegate",
      "--validator",
      "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
      "--wei",
      "1",
      "--isUndelegate",
      "false",
    ]);
    parser(TokenDelegateRequest)(data);
  },
});
