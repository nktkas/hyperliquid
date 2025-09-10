import { DeployAuctionStatus, parser, SpotPairDeployAuctionStatusRequest } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "spotPairDeployAuctionStatus",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.spotPairDeployAuctionStatus(),
        ]);
        schemaCoverage(DeployAuctionStatus, data, {
            ignoreNullTypes: ["#/properties/currentGas"],
            ignoreDefinedTypes: ["#/properties/endGas"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "spotPairDeployAuctionStatus"]);
        parser(SpotPairDeployAuctionStatusRequest)(JSON.parse(data));
    },
});
