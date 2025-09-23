// deno-lint-ignore-file no-import-prefix
import { CandleEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("candle", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<CandleEvent>((resolve) => {
        client.candle({ coin: "SOL", interval: "1m" }, resolve);
      }),
      120_000,
    ),
  ]);
  schemaCoverage(CandleEvent, data, {
    ignoreBranches: {
      "#/properties/i": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
  });
});
