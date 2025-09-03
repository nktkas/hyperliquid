import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertIsError } from "jsr:@std/assert@1";
import { schemaCoverage, SchemaCoverageError } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("vaultModify", async (_t, clients) => {
    await Promise.all([
        clients.exchange.vaultModify({
            vaultAddress: "0x457ab3acf4a4e01156ce269545a9d3d05fff2f0b",
            allowDeposits: null,
            alwaysCloseOnWithdraw: null,
        }),
    ])
        .then((data) => {
            schemaCoverage(SuccessResponse, data);
        }).catch((e) => {
            if (e instanceof SchemaCoverageError) throw e;
            assertIsError(e, ApiRequestError, "Only leader can perform this vault action");
        });
});
