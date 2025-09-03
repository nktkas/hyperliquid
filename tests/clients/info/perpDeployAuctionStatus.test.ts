import { DeployAuctionStatus } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("perpDeployAuctionStatus", async (_t, client) => {
    const data = await Promise.all([
        client.perpDeployAuctionStatus(),
    ]);
    schemaCoverage(DeployAuctionStatus, data, {
        ignoreDefinedTypes: ["#/properties/currentGas", "#/properties/endGas"],
        ignoreNullTypes: ["#/properties/endGas", "#/properties/currentGas"],
    });
});
