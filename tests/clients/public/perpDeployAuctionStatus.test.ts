import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["perpDeployAuctionStatus"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("perpDeployAuctionStatus", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await infoClient.perpDeployAuctionStatus();

    schemaCoverage(MethodReturnType, [data], {
        ignoreTypesByPath: {
            "#/properties/currentGas": ["string", "null"],
            "#/properties/endGas": ["string", "null"],
        },
    });
});
