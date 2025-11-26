// deno-lint-ignore-file no-import-prefix
import { assertRejects } from "jsr:@std/assert@1";
import { parser, ValidatorL1StreamRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

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
    const data = await runCommand(["exchange", "validatorL1Stream", "--riskFreeRate", "0.05"]);
    parser(ValidatorL1StreamRequest)(data);
  },
});
