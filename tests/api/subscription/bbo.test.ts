// deno-lint-ignore-file no-import-prefix
import { BboEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("bbo", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<BboEvent>((resolve) => {
        client.bbo({ coin: "ETH" }, resolve);
      }),
      120_000,
    ),
  ]);
  schemaCoverage(BboEvent, data);
});
