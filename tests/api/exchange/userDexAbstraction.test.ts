// deno-lint-ignore-file no-import-prefix
import { parser, UserDexAbstractionExchangeRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.userDexAbstraction({
          user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          enabled: true,
        });
      },
      ApiRequestError,
      "Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to",
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
    parser(UserDexAbstractionExchangeRequest)(data);
  },
});
