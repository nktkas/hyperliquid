import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const DELEGATION_ADDRESS = "0xedc88158266c50628a9ffbaa1db2635376577eea";
const COMMISSION_ADDRESS = "0x3c83a5cae32a05e88ca6a0350edb540194851a76";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["delegatorRewards"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("delegatorRewards", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.delegatorRewards({ user: DELEGATION_ADDRESS }),
        infoClient.delegatorRewards({ user: COMMISSION_ADDRESS }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
