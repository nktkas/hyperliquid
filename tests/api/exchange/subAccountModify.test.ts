import assert from "node:assert";
import { parser, SubAccountModifyRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "subAccountModify",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.subAccountModify({
          subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          name: String(Date.now()),
        });
      },
      ApiRequestError,
      "Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "subAccountModify",
      "--subAccountUser",
      "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--name",
      "test",
    ]);
    parser(SubAccountModifyRequest)(data);
  },
});
