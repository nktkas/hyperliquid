import { TokenDetails } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("tokenDetails", async (_t, client) => {
    const data = await Promise.all([
        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // genesis = {...}
        client.tokenDetails({ tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }), // genesis = null

        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // deployer = hex
        client.tokenDetails({ tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }), // deployer = null

        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // deployGas = string
        client.tokenDetails({ tokenId: "0xeb62eee3685fc4c43992febcd9e75443" }), // deployGas = null

        client.tokenDetails({ tokenId: "0x3d8a82efa63e86d54a1922c2afdac61e" }), // deployTime = string
        client.tokenDetails({ tokenId: "0xc4bf3f870c0e9465323c0b6ed28096c2" }), // deployTime = null
    ]);
    schemaCoverage(TokenDetails, data, {
        ignoreEmptyArray: ["#/properties/genesis/wrapped/properties/blacklistUsers"],
    });
});
