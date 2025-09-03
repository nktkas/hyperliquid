import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("spotSend", { spot: "1" }, async (_t, clients) => {
    const data = await Promise.all([
        clients.exchange.spotSend({
            destination: "0x0000000000000000000000000000000000000001",
            token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
            amount: "1",
        }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
