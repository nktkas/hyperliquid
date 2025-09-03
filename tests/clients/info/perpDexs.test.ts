import { PerpDex } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("perpDexs", async (_t, client) => {
    const data = await Promise.all([
        client.perpDexs(),
    ]);
    schemaCoverage(v.array(v.nullable(PerpDex)), data);
});
