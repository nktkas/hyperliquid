import { CreateSubAccountResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest("createSubAccount", async (_t, clients) => {
    await Promise.all([
        clients.exchange.createSubAccount({ name: String(Date.now()) }),
    ])
        .then((data) => {
            schemaCoverage(CreateSubAccountResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            anyFnSuccess([
                () => assertIsError(e, ApiRequestError, "Too many sub-accounts"),
                () => assertIsError(e, ApiRequestError, "Cannot create sub-accounts until enough volume traded"),
            ]);
        });
});
