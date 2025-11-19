import assert from "node:assert";
import { parser, SubAccountTransferRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccountTransfer",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.subAccountTransfer({
          subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          isDeposit: true,
          usd: 1,
        });
      },
      (e) => e instanceof ApiRequestError && e.message.includes("Invalid sub-account transfer from"),
    );
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
    parser(SubAccountTransferRequest)(data);
  },
});
