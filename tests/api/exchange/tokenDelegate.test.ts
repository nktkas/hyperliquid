import { parser, SuccessResponse, TokenDelegateRequest } from "@nktkas/hyperliquid/api/exchange";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "tokenDelegate",
  topup: { staking: "0.00000001" },
  codeTestFn: async (_t, clients) => {
    const data = await Promise.all([
      clients.exchange.tokenDelegate({
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
    parser(TokenDelegateRequest)(JSON.parse(data));
  },
});
