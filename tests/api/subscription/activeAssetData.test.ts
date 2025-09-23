// deno-lint-ignore-file no-import-prefix
import { ActiveAssetDataEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("activeAssetData", "api", async (_t, client) => {
  const data = await Promise.all([
    // leverage.type = isolated
    deadline(
      new Promise<ActiveAssetDataEvent>((resolve) => {
        client.activeAssetData(
          { coin: "GALA", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
          resolve,
        );
      }),
      10_000,
    ),
    // leverage.type = cross
    deadline(
      new Promise<ActiveAssetDataEvent>((resolve) => {
        client.activeAssetData(
          { coin: "NEAR", user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" },
          resolve,
        );
      }),
      10_000,
    ),
  ]);
  schemaCoverage(ActiveAssetDataEvent, data);
});
