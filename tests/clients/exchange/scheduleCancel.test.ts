import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("scheduleCancel", async (_t, clients) => {
    await Promise.all([
        clients.exchange.scheduleCancel({ time: Date.now() + 30000 }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Cannot set scheduled cancel time until enough volume traded");
        });
});
