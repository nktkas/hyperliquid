import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const ROLE_MISSING = "0x941a505ACc11F5f3A12b5eF0d414A8Bff45c5e77";
const ROLE_USER = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const ROLE_AGENT = "0xDF1bC1bA4242a47f2AeC1Cd52F9E24b243107a34";
const ROLE_VAULT = "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f";
const ROLE_SUB_ACCOUNT = "0x22a454d3322060475552e8f922ec0c778b8e5760";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["userRole"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userRole", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.userRole({ user: ROLE_MISSING }),
        infoClient.userRole({ user: ROLE_USER }),
        infoClient.userRole({ user: ROLE_AGENT }),
        infoClient.userRole({ user: ROLE_VAULT }),
        infoClient.userRole({ user: ROLE_SUB_ACCOUNT }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
