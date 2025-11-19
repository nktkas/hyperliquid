import assert from "node:assert";
import { parser, UserDexAbstractionRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.userDexAbstraction({
          user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          enabled: true,
        });
      },
      (e) =>
        e instanceof ApiRequestError &&
        e.message.includes("Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to"),
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "userDexAbstraction",
      "--user",
      "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--enabled",
      "true",
    ]);
    parser(UserDexAbstractionRequest)(data);
  },
});
