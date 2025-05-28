import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS_WITH_MULTISIG_SIGNERS = "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb";
const USER_ADDRESS_WITHOUT_MULTISIG_SIGNERS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["userToMultiSigSigners"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userToMultiSigSigners", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.userToMultiSigSigners({ user: USER_ADDRESS_WITHOUT_MULTISIG_SIGNERS }),
        infoClient.userToMultiSigSigners({ user: USER_ADDRESS_WITH_MULTISIG_SIGNERS }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
