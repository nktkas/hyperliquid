import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const NON_REFERRED = "0x0000000000000000000000000000000000000000";
const REFERRED = "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa";
const STATE_READY = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const STATE_NEED_TO_CREATE_CODE = "0x97c36726668f490fa17eb2957a92D39116f171fE";
const STATE_NEED_TO_TRADE = "0x0000000000000000000000000000000000000000";
const REWARD_HISTORY = "0x745d208c08be6743481cdaf5984956be87ec5a3f"; // Mainnet

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["referral"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("referral", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const infoClient = new InfoClient({ transport: new HttpTransport({ isTestnet: true }) });
    const mainnetClient = new InfoClient({ transport: new HttpTransport({ isTestnet: false }) });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.referral({ user: NON_REFERRED }),
        infoClient.referral({ user: REFERRED }),
        infoClient.referral({ user: STATE_READY }),
        infoClient.referral({ user: STATE_NEED_TO_CREATE_CODE }),
        infoClient.referral({ user: STATE_NEED_TO_TRADE }),
        mainnetClient.referral({ user: REWARD_HISTORY }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
