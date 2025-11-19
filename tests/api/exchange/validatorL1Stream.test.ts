import assert from "node:assert";
import { parser, ValidatorL1StreamRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "validatorL1Stream",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.validatorL1Stream({ riskFreeRate: "0.05" });
      },
      (e) => e instanceof ApiRequestError && e.message.includes("Unknown validator"),
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "validatorL1Stream", "--riskFreeRate", "0.05"]);
    parser(ValidatorL1StreamRequest)(data);
  },
});
