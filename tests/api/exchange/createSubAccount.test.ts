// deno-lint-ignore-file no-import-prefix
import { CreateSubAccountRequest, CreateSubAccountResponse, parser } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest({
  name: "createSubAccount",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.createSubAccount({ name: String(Date.now()) }),
    ])
      .then((data) => {
        schemaCoverage(CreateSubAccountResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        anyFnSuccess([
          () => assertIsError(e, ApiRequestError, "Too many sub-accounts"),
          () => assertIsError(e, ApiRequestError, "Cannot create sub-accounts until enough volume traded"),
        ]);
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "createSubAccount", "--name", "12345"]);
    parser(CreateSubAccountRequest)(JSON.parse(data));
  },
});
