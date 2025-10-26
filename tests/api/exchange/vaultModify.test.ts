// deno-lint-ignore-file no-import-prefix
import { parser, VaultModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultModify",
  codeTestFn: async (_t, exchClient) => {
    await assertRejects(
      async () => {
        await exchClient.vaultModify({
          vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
          allowDeposits: null,
          alwaysCloseOnWithdraw: null,
        });
      },
      ApiRequestError,
      "Only leader can perform this vault action",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "vaultModify",
      "--vaultAddress",
      "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
    ]);
    parser(VaultModifyRequest)(data);
  },
});
