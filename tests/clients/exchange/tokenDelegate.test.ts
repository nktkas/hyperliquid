import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("tokenDelegate", { staking: "0.00000001" }, async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.tokenDelegate({
            validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
            wei: 1,
            isUndelegate: false,
        }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
