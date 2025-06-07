import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["candleSnapshot"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("candleSnapshot", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.candleSnapshot({
            coin: "BTC",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
        }),
        // Check argument 'endTime'
        infoClient.candleSnapshot({
            coin: "BTC",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: Date.now(),
        }),
        infoClient.candleSnapshot({
            coin: "BTC",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: null,
        }),
        infoClient.candleSnapshot({
            coin: "BTC",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: undefined,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
