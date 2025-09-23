// deno-lint-ignore-file no-import-prefix
import { parser, SubAccountTransferRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccountTransfer",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.subAccountTransfer({
        subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        isDeposit: true,
        usd: 1,
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
      "subAccountTransfer",
      "--subAccountUser",
      "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--isDeposit",
      "true",
      "--usd",
      "1",
    ]);
    parser(SubAccountTransferRequest)(JSON.parse(data));
  },
});
