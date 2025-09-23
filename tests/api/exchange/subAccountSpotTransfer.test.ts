// deno-lint-ignore-file no-import-prefix
import { parser, SubAccountSpotTransferRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccountSpotTransfer",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.subAccountSpotTransfer({
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        isDeposit: true,
        token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
        amount: "1",
      }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "Invalid sub-account transfer from");
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "subAccountSpotTransfer",
      "--subAccountUser",
      "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--isDeposit",
      "true",
      "--token",
      "USDC:0xeb62eee3685fc4c43992febcd9e75443",
      "--amount",
      "1",
    ]);
    parser(SubAccountSpotTransferRequest)(JSON.parse(data));
  },
});
