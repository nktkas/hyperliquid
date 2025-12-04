// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { SubAccountModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "subAccountModify",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
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
      "--subAccountUser=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--name=test",
    ]);
    v.parse(SubAccountModifyRequest, data);
  },
});
