// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { ValidatorL1StreamRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "validatorL1Stream",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.validatorL1Stream({ riskFreeRate: "0.05" });
      },
      ApiRequestError,
      "Unknown validator",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "validatorL1Stream",
      "--riskFreeRate=0.05",
    ]);
    v.parse(ValidatorL1StreamRequest, data);
  },
});
