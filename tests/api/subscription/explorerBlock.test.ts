// deno-lint-ignore-file no-import-prefix
import { ExplorerBlockEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("explorerBlock", "rpc", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<ExplorerBlockEvent>((resolve) => {
        client.explorerBlock(resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(ExplorerBlockEvent, data);
});
