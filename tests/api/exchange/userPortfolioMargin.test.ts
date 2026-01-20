// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { UserPortfolioMarginRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "userPortfolioMargin",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.userPortfolioMargin({
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
      "userPortfolioMargin",
      "--user=0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
      "--enabled=true",
    ]);
    v.parse(UserPortfolioMarginRequest, data);
  },
});
