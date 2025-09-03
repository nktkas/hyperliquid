import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest("setReferrer", async (_t, clients) => {
    await Promise.all([
        clients.exchange.setReferrer({ code: "TEST" }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            anyFnSuccess([
                () => assertIsError(e, ApiRequestError, "Cannot self-refer"),
                () => assertIsError(e, ApiRequestError, "Referrer already set"),
            ]);
        });
});
