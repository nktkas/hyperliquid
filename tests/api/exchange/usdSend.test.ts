import { parser, SuccessResponse, UsdSendRequest } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "usdSend",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdSend({
        destination: "0x0000000000000000000000000000000000000001",
        amount: "1",
      }),
    ]);
    schemaCoverage(SuccessResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "usdSend",
      "--destination",
      "0x0000000000000000000000000000000000000001",
      "--amount",
      "1",
    ]);
    parser(UsdSendRequest)(data);
  },
});
