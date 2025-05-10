import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<EventClient["userFundings"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userFundings", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using client = new EventClient({ transport });

    // —————————— Test ——————————

    const data = await deadline(
        new Promise((resolve) => {
            client.userFundings({ user: USER_ADDRESS }, resolve);
        }),
        10_000,
    );

    schemaCoverage(MethodReturnType, [data], {
        ignoreTypesByPath: {
            "#/properties/fundings/items/properties/nSamples": ["number"],
        },
    });
});
