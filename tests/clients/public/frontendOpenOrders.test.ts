import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["frontendOpenOrders"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("frontendOpenOrders", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.frontendOpenOrders({ user: USER_ADDRESS }),
        client.frontendOpenOrders({ user: USER_ADDRESS, dex: "test" }),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreEnumValuesByPath: {
            "#/items/properties/orderType": ["Market"],
            "#/items/properties/tif/anyOf/0": ["Ioc", "FrontendMarket", "LiquidationMarket"],
        },
    });
});
