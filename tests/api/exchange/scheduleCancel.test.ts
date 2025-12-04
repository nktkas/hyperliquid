// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "scheduleCancel",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.scheduleCancel({ time: Date.now() + 30000 });
      },
      ApiRequestError,
      "Cannot set scheduled cancel time until enough volume traded",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "scheduleCancel",
      "--time=170000000000",
    ]);
    v.parse(ScheduleCancelRequest, data);
  },
});
