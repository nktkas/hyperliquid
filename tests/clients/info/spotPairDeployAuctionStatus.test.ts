import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["spotPairDeployAuctionStatus"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.spotPairDeployAuctionStatus();
    schemaCoverage(MethodReturnType, [data], {
        ignoreTypesByPath: {
            "#/properties/currentGas": ["string", "null"],
            "#/properties/endGas": ["string", "null"],
        },
    });
}

runTest("spotPairDeployAuctionStatus", testFn);
