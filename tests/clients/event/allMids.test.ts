import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<EventClient["allMids"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("allMids", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using client = new EventClient({ transport });

    // —————————— Test ——————————

    const data1 = await deadline(
        new Promise((resolve) => {
            client.allMids(resolve);
        }),
        10_000,
    );
    const data2 = await deadline(
        new Promise((resolve) => {
            client.allMids({ dex: "test" }, resolve);
        }),
        10_000,
    );

    schemaCoverage(MethodReturnType, [data1, data2]);
});
