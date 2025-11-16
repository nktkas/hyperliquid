import assert from "node:assert";
import { parser, VaultTransferRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultTransfer",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.vaultTransfer({
          vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
          isDeposit: false,
          usd: 5 * 1e6,
        });
      },
      ApiRequestError,
      "Cannot withdraw with zero balance in vault",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "vaultTransfer",
      "--vaultAddress",
      "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
      "--isDeposit",
      "false",
      "--usd",
      "5000000",
    ]);
    parser(VaultTransferRequest)(data);
  },
});
