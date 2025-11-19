import assert from "node:assert";
import { parser, SubAccountSpotTransferRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccountSpotTransfer",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.subAccountSpotTransfer({
          subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          isDeposit: true,
          token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
          amount: "1",
        });
      },
      (e) => e instanceof ApiRequestError && e.message.includes("Invalid sub-account transfer from"),
    );
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
    parser(SubAccountSpotTransferRequest)(data);
  },
});
