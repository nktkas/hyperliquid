import assert from "node:assert";
import { CreateSubAccountRequest, parser } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "createSubAccount",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.createSubAccount({ name: String(Date.now()) });
      },
      (e) =>
        e instanceof ApiRequestError && e.message.includes("Cannot create sub-accounts until enough volume traded"),
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "createSubAccount", "--name", "12345"]);
    parser(CreateSubAccountRequest)(data);
  },
});
