import { DeployAuctionStatus, parser, PerpDeployAuctionStatusRequest } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "perpDeployAuctionStatus",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.perpDeployAuctionStatus(),
        ]);
        schemaCoverage(DeployAuctionStatus, data, {
            ignoreDefinedTypes: ["#/properties/currentGas", "#/properties/endGas"],
            ignoreNullTypes: ["#/properties/endGas", "#/properties/currentGas"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "perpDeployAuctionStatus"]);
        parser(PerpDeployAuctionStatusRequest)(JSON.parse(data));
    },
});
