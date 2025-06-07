import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";
const USER_ADDRESS_evmEscrows = "0x1defed46db35334232b9f5fd2e5c6180276fb99d";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["spotClearinghouseState"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("spotClearinghouseState", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.spotClearinghouseState({ user: USER_ADDRESS }),
        infoClient.spotClearinghouseState({ user: USER_ADDRESS, dex: "test" }),
        infoClient.spotClearinghouseState({ user: USER_ADDRESS_evmEscrows }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
