import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const TOKEN_ID_WITH_GENESIS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_GENESIS = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOYER = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOYER = "0xc4bf3f870c0e9465323c0b6ed28096c2";

const TOKEN_ID_WITH_DEPLOY_GAS = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_GAS = "0xeb62eee3685fc4c43992febcd9e75443";

const TOKEN_ID_WITH_DEPLOY_TIME = "0x3d8a82efa63e86d54a1922c2afdac61e";
const TOKEN_ID_WITHOUT_DEPLOY_TIME = "0xc4bf3f870c0e9465323c0b6ed28096c2";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["tokenDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("tokenDetails", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITH_GENESIS }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_GENESIS }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOYER }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOYER }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_GAS }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_GAS }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITH_DEPLOY_TIME }),
        infoClient.tokenDetails({ tokenId: TOKEN_ID_WITHOUT_DEPLOY_TIME }),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreEmptyArrayPaths: [
            "#/properties/genesis/anyOf/0/properties/blacklistUsers",
        ],
    });
});
