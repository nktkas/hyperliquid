import { VaultSummary } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("vaultSummaries", async (_t, client) => {
    const data = await Promise.all([
        client.vaultSummaries(),
    ]);
    schemaCoverage(v.array(VaultSummary), data, {
        ignoreEmptyArray: ["#"],
    });
});
