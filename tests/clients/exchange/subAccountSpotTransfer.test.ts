import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("subAccountSpotTransfer", async (_t, clients) => {
    await Promise.all([
        clients.exchange.subAccountSpotTransfer({
            subAccountUser: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
            isDeposit: true,
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "1",
        }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Invalid sub-account transfer from");
        });
});
