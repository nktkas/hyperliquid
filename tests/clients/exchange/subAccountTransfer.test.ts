import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("subAccountTransfer", async (_t, clients) => {
    await Promise.all([
        clients.exchange.subAccountTransfer({
            subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
            isDeposit: true,
            usd: 1,
        }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Invalid sub-account transfer from");
        });
});
