import { parser, SpotSendRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotSend",
  topup: { spot: "1" },
  codeTestFn: async (_t, clients) => {
    const data = await Promise.all([
      clients.exchange.spotSend({
        destination: "0x0000000000000000000000000000000000000001",
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      }),
    ]);
    schemaCoverage(SuccessResponse, data);
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
    parser(SpotSendRequest)(JSON.parse(data));
  },
});
