// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { UserSetAbstractionRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "userSetAbstraction",
  codeTestFn: async (_t, exchClient) => {
    // FIXME: Multisig does not support this method.
    //        Unknown whether this is an SDK issue or a Hyperliquid limitation.
    if ("signers" in exchClient.config_) return;

    await assertRejects(
      async () => {
        await exchClient.userSetAbstraction({
          user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
          abstraction: "dexAbstraction",
        });
      },
      ApiRequestError,
      "Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "userSetAbstraction",
      "--user=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--abstraction=dexAbstraction",
    ]);
    v.parse(UserSetAbstractionRequest, data);
  },
});
