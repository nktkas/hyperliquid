import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("vaultTransfer", async (_t, clients) => {
    await Promise.all([
        clients.exchange.vaultTransfer({
            vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
            isDeposit: false,
            usd: 5 * 1e6,
        }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Cannot withdraw with zero balance in vault");
        });
});
