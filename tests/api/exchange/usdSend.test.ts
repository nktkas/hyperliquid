import * as v from "@valibot/valibot";
import { UsdSendRequest, UsdSendResponse } from "@nktkas/hyperliquid/api/exchange";
import { excludeErrorResponse, runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "usdSend",
  codeTestFn: async (_t, exchClient) => {
    const data = await Promise.all([
      exchClient.usdSend({
        destination: "0x0000000000000000000000000000000000000001",
        amount: "1",
      }),
    ]);
    schemaCoverage(excludeErrorResponse(UsdSendResponse), data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "usdSend",
      "--destination=0x0000000000000000000000000000000000000001",
      "--amount=1",
    ]);
    v.parse(UsdSendRequest, data);
  },
});
