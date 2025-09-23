// deno-lint-ignore-file no-import-prefix
import { CreateVaultRequest, CreateVaultResponse, parser } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "createVault",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.createVault({
        name: "test",
        description: "1234567890",
        initialUsd: Number.MAX_SAFE_INTEGER,
        nonce: Date.now(),
      }),
    ])
      .then((data) => {
        schemaCoverage(CreateVaultResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "Insufficient balance to create vault");
      });
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
    parser(CreateVaultRequest)(JSON.parse(data));
  },
});
