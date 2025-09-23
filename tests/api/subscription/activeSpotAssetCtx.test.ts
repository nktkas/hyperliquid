// deno-lint-ignore-file no-import-prefix
import { ActiveSpotAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("activeSpotAssetCtx", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<ActiveSpotAssetCtxEvent>((resolve) => {
        client.activeSpotAssetCtx({ coin: "@107" }, resolve);
      }),
      10_000,
    ),
    deadline(
      new Promise<ActiveSpotAssetCtxEvent>((resolve) => {
        client.activeSpotAssetCtx({ coin: "@27" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(ActiveSpotAssetCtxEvent, data);
});
