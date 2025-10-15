// deno-lint-ignore-file no-import-prefix
import { L2BookEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("l2Book", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<L2BookEvent>((resolve) => {
        client.l2Book({ coin: "BTC" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(L2BookEvent, data);
});
