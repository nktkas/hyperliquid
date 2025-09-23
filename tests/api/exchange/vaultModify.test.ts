// deno-lint-ignore-file no-import-prefix
import { parser, SuccessResponse, VaultModifyRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "vaultModify",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.vaultModify({
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        allowDeposits: null,
        alwaysCloseOnWithdraw: null,
      }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        assertIsError(e, ApiRequestError, "Only leader can perform this vault action");
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "vaultModify",
      "--vaultAddress",
      "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
    ]);
    parser(VaultModifyRequest)(JSON.parse(data));
  },
});
