// deno-lint-ignore-file no-import-prefix
import { WsClearinghouseState } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("clearinghouseState", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsClearinghouseState>((resolve) => {
                client.clearinghouseState({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(WsClearinghouseState, data);
});
