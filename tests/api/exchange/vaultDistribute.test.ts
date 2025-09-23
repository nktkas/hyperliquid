// deno-lint-ignore-file no-import-prefix
import { parser, SuccessResponse, VaultDistributeRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../_schemaCoverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest({
  name: "vaultDistribute",
  codeTestFn: async (_t, clients) => {
    await Promise.all([
      clients.exchange.vaultDistribute({
        vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
        usd: 1 * 1e6,
      }),
    ])
      .then((data) => {
        schemaCoverage(SuccessResponse, data);
      }).catch((e) => {
        if (e instanceof SchemaCoverageError) throw e;
        anyFnSuccess([
          () => assertIsError(e, ApiRequestError, "Only leader can perform this vault action"),
          () => assertIsError(e, ApiRequestError, "Must distribute at least $10"),
        ]);
      });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "vaultDistribute",
      "--vaultAddress",
      "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
      "--usd",
      "1000000",
    ]);
    parser(VaultDistributeRequest)(JSON.parse(data));
  },
});
