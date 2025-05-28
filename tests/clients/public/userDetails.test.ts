import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["userDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userDetails", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await infoClient.userDetails({ user: USER_ADDRESS });

    schemaCoverage(MethodReturnType, [data], {
        ignoreTypesByPath: {
            "#/properties/txs/items/properties/error": ["string"],
        },
    });
});
