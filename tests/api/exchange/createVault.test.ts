import assert from "node:assert";
import { CreateVaultRequest, parser } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "createVault",
  codeTestFn: async (_t, exchClient) => {
    await assert.rejects(
      async () => {
        await exchClient.createVault({
          name: "test",
          description: "1234567890",
          initialUsd: Number.MAX_SAFE_INTEGER,
          nonce: Date.now(),
        });
      },
      ApiRequestError,
      "Insufficient balance to create vault",
    );
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "createVault",
      "--name",
      "test",
      "--description",
      "1234567890",
      "--initialUsd",
      "100000000",
      "--nonce",
      "1234567890",
    ]);
    parser(CreateVaultRequest)(data);
  },
});
