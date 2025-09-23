// deno-lint-ignore-file no-import-prefix
import { ActiveAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("activeAssetCtx", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<ActiveAssetCtxEvent>((resolve) => {
        client.activeAssetCtx({ coin: "ETH" }, resolve);
      }),
      10_000,
    ),
    deadline(
      new Promise<ActiveAssetCtxEvent>((resolve) => {
        client.activeAssetCtx({ coin: "AXL" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(ActiveAssetCtxEvent, data);
});
