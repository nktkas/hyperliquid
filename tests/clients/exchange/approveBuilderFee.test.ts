import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("approveBuilderFee", async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.approveBuilderFee({
            maxFeeRate: "0.001%",
            builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
