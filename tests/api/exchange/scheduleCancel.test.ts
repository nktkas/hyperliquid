import assert from "node:assert";
import { parser, ScheduleCancelRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "scheduleCancel",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.scheduleCancel({ time: Date.now() + 30000 });
      },
      ApiRequestError,
      "Cannot set scheduled cancel time until enough volume traded",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["exchange", "scheduleCancel", "--time", "170000000000"]);
    parser(ScheduleCancelRequest)(data);
  },
});
