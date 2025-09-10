// deno-lint-ignore-file no-import-prefix
import { Book } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("l2Book", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<Book>((resolve) => {
                client.l2Book({ coin: "ETH" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(Book, data);
});
