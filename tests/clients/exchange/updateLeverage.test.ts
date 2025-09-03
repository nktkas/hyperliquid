import { SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { getAssetData, runTest } from "./_t.ts";

runTest("updateLeverage", async (_t, clients) => {
    // —————————— Prepare ——————————

    const { id } = await getAssetData("SOL");

    // —————————— Test ——————————

    const data = await Promise.all([
        clients.exchange.updateLeverage({ asset: id, isCross: true, leverage: 1 }),
    ]);
    schemaCoverage(SuccessResponse, data);
});
