import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const TOKEN_ID_WITH_GENESIS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_GENESIS = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOYER = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOYER = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOY_GAS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_GAS = "0xeb62eee3685fc4c43992febcd9e75443";

const TOKEN_ID_WITH_DEPLOY_TIME = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_TIME = "0xc4bf3f870c0e9465323c0b6ed28096c2";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["tokenDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("tokenDetails", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_GENESIS }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOYER }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOYER }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_GAS }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_GAS }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_TIME }),
        client.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_TIME }),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreEmptyArrayPaths: [
            "#/properties/genesis/anyOf/0/properties/blacklistUsers",
        ],
    });
});
