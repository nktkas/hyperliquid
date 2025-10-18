// deno-lint-ignore-file no-import-prefix
import { parser, SuccessResponse, UserDexAbstractionExchangeRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userDexAbstraction",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.userDexAbstraction({
        user: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
        enabled: true,
      }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(
          e,
          ApiRequestError,
          `Sub-account 0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1 is not registered to`,
        );
      });
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
    parser(UserDexAbstractionExchangeRequest)(JSON.parse(data));
  },
});
