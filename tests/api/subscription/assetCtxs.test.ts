// deno-lint-ignore-file no-import-prefix
import { AssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("assetCtxs", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<AssetCtxsEvent>((resolve) => {
        client.assetCtxs(resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(AssetCtxsEvent, data);
});
