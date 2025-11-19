import { parser, SpotSendRequest, SpotSendResponse } from "../../../src/api/exchange/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { excludeErrorResponse, runTest, topUpSpot } from "./_t.ts";

runTest({
  name: "spotSend",
  codeTestFn: async (_t, exchClient) => {
    // —————————— Prepare ——————————

    await topUpSpot(exchClient, "USDC", "2");

    // —————————— Test ——————————

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
      "--destination",
      "0x0000000000000000000000000000000000000001",
      "--token",
      "USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount",
      "1",
    ]);
    parser(SpotSendRequest)(data);
  },
});
