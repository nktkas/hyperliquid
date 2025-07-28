import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["spotDeployState"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.spotDeployState({ user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }), // states.fullName = string
        client.spotDeployState({ user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }), // states.fullName = null
        client.spotDeployState({ user: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db" }), // states.maxSupply = string
        client.spotDeployState({ user: "0xd8cb8d9747f50be8e423c698f9104ee090540961" }), // states.maxSupply = null
    ]);
    schemaCoverage(MethodReturnType, data, {
        ignoreEmptyArrayPaths: [
            "#/properties/states/items/properties/blacklistUsers",
        ],
        ignoreTypesByPath: {
            "#/properties/gasAuction/properties/currentGas": ["string", "null"],
            "#/properties/gasAuction/properties/endGas": ["string", "null"],
        },
    });
}

runTest("spotDeployState", testFn);
