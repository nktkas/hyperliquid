import { PerpsMeta } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("meta", async (_t, client) => {
    const data = await Promise.all([
        client.meta(),
        client.meta({ dex: "test" }),
    ]);
    schemaCoverage(PerpsMeta, data);
});
