import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const STATES_FULL_NAME_STRING = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";
const STATES_FULL_NAME_NULL = "0xd8cb8d9747f50be8e423c698f9104ee090540961";
const STATES_MAX_SUPPLY_STRING = "0x051dbfc562d44e4a01ebb986da35a47ab4f346db";
const STATES_MAX_SUPPLY_NULL = "0xd8cb8d9747f50be8e423c698f9104ee090540961";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["spotDeployState"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("spotDeployState", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.spotDeployState({ user: STATES_FULL_NAME_STRING }),
        client.spotDeployState({ user: STATES_FULL_NAME_NULL }),
        client.spotDeployState({ user: STATES_MAX_SUPPLY_STRING }),
        client.spotDeployState({ user: STATES_MAX_SUPPLY_NULL }),
    ]);

    schemaCoverage(MethodReturnType, data, {
        ignoreEmptyArrayPaths: [
            "#/properties/states/items/properties/blacklistUsers",
        ],
        ignoreTypesByPath: {
            "#/properties/gasAuction/properties/currentGas": ["string", "null"],
            "#/properties/gasAuction/properties/endGas": ["string", "null"],
        },
    });
});
