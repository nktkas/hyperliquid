// deno-lint-ignore-file no-import-prefix
import { parser, SetReferrerRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest({
  name: "setReferrer",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.setReferrer({ code: "TEST" }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        anyFnSuccess([
          () => assertIsError(e, ApiRequestError, "Cannot self-refer"),
          () => assertIsError(e, ApiRequestError, "Referrer already set"),
        ]);
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "setReferrer", "--code", "TEST"]);
    parser(SetReferrerRequest)(JSON.parse(data));
  },
});
