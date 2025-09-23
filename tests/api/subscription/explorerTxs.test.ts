// deno-lint-ignore-file no-import-prefix
import { ExplorerTxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("explorerTxs", "rpc", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<ExplorerTxsEvent>((resolve) => {
        client.explorerTxs(resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(ExplorerTxsEvent, data, {
    ignoreDefinedTypes: ["#/items/properties/error"],
  });
});
