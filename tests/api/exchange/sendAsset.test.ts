import { parser, SendAssetRequest, SendAssetResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest } from "./_t.ts";

runTest({
  name: "sendAsset",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.sendAsset({
        destination: "0x0000000000000000000000000000000000000001",
        sourceDex: "",
        destinationDex: "test",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
        fromSubAccount: "",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(SendAssetResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "sendAsset",
      "--destination",
      "0x0000000000000000000000000000000000000001",
      "--sourceDex",
      "",
      "--destinationDex",
      "test",
      "--token",
      "USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount",
      "1",
    ]);
    parser(SendAssetRequest)(data);
  },
});
