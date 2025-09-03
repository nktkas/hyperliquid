import { Book } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("l2Book", async (_t, client) => {
    const data = await Promise.all([
        client.l2Book({ coin: "ETH" }),
    ]);
    schemaCoverage(Book, data);
});
