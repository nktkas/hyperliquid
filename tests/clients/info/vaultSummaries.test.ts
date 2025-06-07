import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["vaultSummaries"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultSummaries", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await infoClient.vaultSummaries();

    schemaCoverage(MethodReturnType, [data], {
        ignoreBranchesByPath: {
            "#/items/properties/relationship/anyOf": [1],
        },
        ignoreEnumValuesByPath: {
            "#/items/properties/relationship/anyOf/0/properties/type": ["child"],
        },
        ignoreEmptyArrayPaths: ["#"],
    });
});
