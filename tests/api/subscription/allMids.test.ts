// deno-lint-ignore-file no-import-prefix
import { AllMidsEvent } from "@nktkas/hyperliquid/api/subscription";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest("allMids", "api", async (_t, client) => {
  const data = await Promise.all([
    deadline(
      new Promise<AllMidsEvent>((resolve) => {
        client.allMids(resolve);
      }),
      10_000,
    ),
    deadline(
      new Promise<AllMidsEvent>((resolve) => {
        client.allMids({ dex: "unit" }, resolve);
      }),
      10_000,
    ),
  ]);
  schemaCoverage(AllMidsEvent, data);
});
