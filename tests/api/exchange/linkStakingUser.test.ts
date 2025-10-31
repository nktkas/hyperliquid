// deno-lint-ignore-file no-import-prefix
import { LinkStakingUserRequest, parser } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "linkStakingUser",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.linkStakingUser({
          user: "0x0000000000000000000000000000000000000001",
          isFinalize: false,
        });
      },
      ApiRequestError,
      "Staking link error",
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
