import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["subAccounts"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.subAccounts({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }), // length > 0
        client.subAccounts({ user: "0x0000000000000000000000000000000000000001" }), // null
    ]);
    schemaCoverage(MethodReturnType, data, {
        ignoreBranchesByPath: {
            "#/anyOf/0/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/leverage/anyOf":
                [0],
        },
        ignoreTypesByPath: {
            "#/anyOf/0/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/liquidationPx":
                ["string"],
        },
        ignorePropertiesByPath: [
            "#/anyOf/0/items/properties/spotState/properties/evmEscrows",
        ],
    });
}

runTest("subAccounts", testFn);
