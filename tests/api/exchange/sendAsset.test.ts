import * as v from "@valibot/valibot";
import { SendAssetRequest, SendAssetResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

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
      "--destination=0x0000000000000000000000000000000000000001",
      "--sourceDex=",
      "--destinationDex=test",
      "--token=USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount=1",
    ]);
    v.parse(SendAssetRequest, data);
  },
});
