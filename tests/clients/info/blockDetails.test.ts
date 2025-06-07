import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const BLOCK_HEIGHT = 300836507;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["blockDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("blockDetails", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await infoClient.blockDetails({ height: BLOCK_HEIGHT });

    schemaCoverage(MethodReturnType, [data]);
});
