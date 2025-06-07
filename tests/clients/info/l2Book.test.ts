import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["l2Book"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("l2Book", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.l2Book({ coin: "BTC" }),
        // Check argument 'nSigFigs'
        infoClient.l2Book({ coin: "BTC", nSigFigs: 2 }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: 3 }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: 4 }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: 5 }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: null }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: undefined }),
        // Check argument 'mantissa'
        infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: 2 }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: 5 }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: null }),
        infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: undefined }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
