import assert from "node:assert";
import { LinkStakingUserRequest, parser } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "linkStakingUser",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.linkStakingUser({
          user: "0x0000000000000000000000000000000000000001",
          isFinalize: false,
        });
      },
      (e) => e instanceof ApiRequestError && e.message.includes("Staking link error"),
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "linkStakingUser",
      "--user",
      "0x0000000000000000000000000000000000000001",
      "--isFinalize",
      "false",
    ]);
    parser(LinkStakingUserRequest)(data);
  },
});
