import { DeployAuctionStatus } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("spotPairDeployAuctionStatus", async (_t, client) => {
    const data = await Promise.all([
        client.spotPairDeployAuctionStatus(),
    ]);
    schemaCoverage(DeployAuctionStatus, data, {
        ignoreNullTypes: ["#/properties/currentGas"],
        ignoreDefinedTypes: ["#/properties/endGas"],
    });
});
