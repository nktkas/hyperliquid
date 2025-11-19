import assert from "node:assert";
import { parser, VaultModifyRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultModify",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.vaultModify({
          vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
          allowDeposits: null,
          alwaysCloseOnWithdraw: null,
        });
      },
      (e) => e instanceof ApiRequestError && e.message.includes("Only leader can perform this vault action"),
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
