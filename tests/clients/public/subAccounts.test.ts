import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const USER_ADDRESS_WITHOUT_SUBACCOUNTS = "0x0000000000000000000000000000000000000000";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["subAccounts"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("subAccounts", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.subAccounts({ user: USER_ADDRESS_WITHOUT_SUBACCOUNTS }),
        infoClient.subAccounts({ user: USER_ADDRESS }),
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
    });
});
