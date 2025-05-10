import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { EventClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<EventClient["userTwapHistory"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("userTwapHistory", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using client = new EventClient({ transport });

    // —————————— Test ——————————

    const data = await deadline(
        new Promise((resolve) => {
            client.userTwapHistory({ user: USER_ADDRESS }, resolve);
        }),
        10_000,
    );

    schemaCoverage(MethodReturnType, [data]);
});
