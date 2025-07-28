import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["tokenDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await Promise.all([
        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // genesis = { ... }
        client.tokenDetails({ tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }), // genesis = null

        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // deployer = hex
        client.tokenDetails({ tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }), // deployer = null

        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // deployGas = string
        client.tokenDetails({ tokenId: "0xeb62eee3685fc4c43992febcd9e75443" }), // deployGas = null

        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // deployTime = string
        client.tokenDetails({ tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }), // deployTime = null
    ]);
    schemaCoverage(MethodReturnType, data, {
        ignoreEmptyArrayPaths: [
            "#/properties/genesis/anyOf/0/properties/blacklistUsers",
        ],
    });
}

runTest("tokenDetails", testFn);
