import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["vaultSummaries"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.vaultSummaries();
    schemaCoverage(MethodReturnType, [data], {
        ignoreBranchesByPath: {
            "#/items/properties/relationship/anyOf": [1],
        },
        ignoreEnumValuesByPath: {
            "#/items/properties/relationship/anyOf/0/properties/type": ["child"],
        },
        ignoreEmptyArrayPaths: ["#"],
    });
}

runTest("vaultSummaries", testFn);
