// deno-lint-ignore-file no-import-prefix
import { parser, SuccessResponse, VaultTransferRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultTransfer",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.vaultTransfer({
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        isDeposit: false,
        usd: 5 * 1e6,
      }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "Cannot withdraw with zero balance in vault");
      });
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
    parser(VaultTransferRequest)(JSON.parse(data));
  },
});
