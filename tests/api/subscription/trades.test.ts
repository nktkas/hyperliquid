// deno-lint-ignore-file no-import-prefix
import { TradesEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("trades", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<TradesEvent>((resolve) => {
        client.trades({ coin: "BTC" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(TradesEvent, data, {
    ignoreBranches: {
      "#/items/properties/side": [0, 1],
    },
  });
});
