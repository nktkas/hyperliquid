import * as v from "@valibot/valibot";
import { SpotSendRequest, SpotSendResponse } from "@nktkas/hyperliquid/api/exchange";
import { runTest, topUpSpot } from "./_t.ts";
import { excludeErrorResponse, schemaCoverage } from "../_utils/schemaCoverageHyperliquid.ts";

runTest({
  name: "spotSend",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    await topUpSpot(exchClient, "USDC", "2");

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.spotSend({
        destination: "0x0000000000000000000000000000000000000001",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(SpotSendResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "spotSend",
      "--destination=0x0000000000000000000000000000000000000001",
      "--token=USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount=1",
    ]);
    v.parse(SpotSendRequest, data);
  },
});
