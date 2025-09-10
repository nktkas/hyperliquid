// deno-lint-ignore-file no-import-prefix
import { TxDetails } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("explorerTxs", "rpc", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<TxDetails[]>((resolve) => {
                client.explorerTxs(resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(v.array(TxDetails), data, {
        ignoreDefinedTypes: ["#/items/properties/error"],
    });
});
