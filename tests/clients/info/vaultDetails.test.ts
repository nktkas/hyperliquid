import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const INVALID_VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
const VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP = "0x1719884eb866cb12b2287399b15f7db5e7d775ea";
const VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP = "0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0";
const VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP_USER = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const VAULT_ADDRESS_WITH_CHILD_RELATIONSHIP = "0x768484f7e2ebb675c57838366c02ae99ba2a9b08";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["vaultDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultDetails", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.vaultDetails({ vaultAddress: INVALID_VAULT_ADDRESS }),
        infoClient.vaultDetails({ vaultAddress: VAULT_ADDRESS_WITH_NORMAL_RELATIONSHIP }),
        infoClient.vaultDetails({
            vaultAddress: VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP,
            user: VAULT_ADDRESS_WITH_PARENT_RELATIONSHIP_USER,
        }),
        infoClient.vaultDetails({ vaultAddress: VAULT_ADDRESS_WITH_CHILD_RELATIONSHIP }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
