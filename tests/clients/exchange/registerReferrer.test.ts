import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { anyFnSuccess, runTest } from "./_t.ts";

runTest("registerReferrer", async (_t, clients) => {
    await Promise.all([
        clients.exchange.registerReferrer({ code: "TEST" }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            anyFnSuccess([
                () => assertIsError(e, ApiRequestError, "Referral code already registered"),
                () => assertIsError(e, ApiRequestError, "Cannot generate referral code until enough volume traded"),
            ]);
        });
});
