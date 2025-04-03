import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const DELEGATION_ADDRESS = "0xedc88158266c50628a9ffbaa1db2635376577eea";
const COMMISSION_ADDRESS = "0x3c83a5cae32a05e88ca6a0350edb540194851a76";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["delegatorRewards"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("delegatorRewards", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.delegatorRewards({ user: DELEGATION_ADDRESS }),
        client.delegatorRewards({ user: COMMISSION_ADDRESS }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
