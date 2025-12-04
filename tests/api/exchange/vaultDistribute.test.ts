// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { VaultDistributeRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultDistribute",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.vaultDistribute({
          vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
          usd: 1 * 1e6,
        });
      },
      ApiRequestError,
      "Only leader can perform this vault action",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "vaultDistribute",
      "--vaultAddress=0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
      "--usd=1000000",
    ]);
    v.parse(VaultDistributeRequest, data);
  },
});
