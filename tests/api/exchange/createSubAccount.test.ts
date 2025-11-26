// deno-lint-ignore-file no-import-prefix
import { assertRejects } from "jsr:@std/assert@1";
import { CreateSubAccountRequest, parser } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "createSubAccount",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.createSubAccount({ name: String(Date.now()) });
      },
      ApiRequestError,
      "Cannot create sub-accounts until enough volume traded",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "createSubAccount", "--name", "12345"]);
    parser(CreateSubAccountRequest)(data);
  },
});
