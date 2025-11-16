import assert from "node:assert";
import { CSignerActionRequest, parser } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "cSignerAction",
  codeTestFn: async (t, exchClient) => {
    await t.test("jailSelf", async () => {
      await assert.rejects(
        async () => {
          await exchClient.cSignerAction({ jailSelf: null });
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      );
    });

    await t.test("unjailSelf", async () => {
      await assert.rejects(
        async () => {
          await exchClient.cSignerAction({ unjailSelf: null });
        },
        ApiRequestError,
        "Signer invalid or inactive for current epoch",
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "cSignerAction", "--jailSelf", "null"]);
    parser(CSignerActionRequest)(data);
  },
});
