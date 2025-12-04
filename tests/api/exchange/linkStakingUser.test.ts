// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { LinkStakingUserRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

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
      "--user=0x0000000000000000000000000000000000000001",
      "--isFinalize=false",
    ]);
    v.parse(LinkStakingUserRequest, data);
  },
});
