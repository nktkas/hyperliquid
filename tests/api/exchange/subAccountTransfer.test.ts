// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { SubAccountTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "subAccountTransfer",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.subAccountTransfer({
          subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          isDeposit: true,
          usd: 1,
        });
      },
      ApiRequestError,
      "Invalid sub-account transfer from",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "subAccountTransfer",
      "--subAccountUser=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--isDeposit=true",
      "--usd=1",
    ]);
    v.parse(SubAccountTransferRequest, data);
  },
});
