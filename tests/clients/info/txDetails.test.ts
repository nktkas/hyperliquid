import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

const TX_HASH_WITH_ERROR = "0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71";
const TX_HASH_WITHOUT_ERROR = "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["txDetails"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("txDetails", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.txDetails({ hash: TX_HASH_WITH_ERROR }),
        infoClient.txDetails({ hash: TX_HASH_WITHOUT_ERROR }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
