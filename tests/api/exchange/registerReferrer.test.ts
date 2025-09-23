// deno-lint-ignore-file no-import-prefix
import { parser, RegisterReferrerRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest({
  name: "registerReferrer",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.registerReferrer({ code: "TEST" }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        anyFnSuccess([
          () => assertIsError(e, ApiRequestError, "Referral code already registered"),
          () => assertIsError(e, ApiRequestError, "Cannot generate referral code until enough volume traded"),
        ]);
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "registerReferrer", "--code", "TEST"]);
    parser(RegisterReferrerRequest)(JSON.parse(data));
  },
});
