// deno-lint-ignore-file no-import-prefix
import { parser, ScheduleCancelRequest, SuccessResponse } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "scheduleCancel",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.scheduleCancel({ time: Date.now() + 30000 }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "Cannot set scheduled cancel time until enough volume traded");
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "scheduleCancel", "--time", "170000000000"]);
    parser(ScheduleCancelRequest)(JSON.parse(data));
  },
});
