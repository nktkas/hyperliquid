import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import { SubscriptionClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["candle"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("candle", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport();
    await using subsClient = new SubscriptionClient({ transport });

    // —————————— Test ——————————

    const data = await deadline(
        new Promise((resolve) => {
            subsClient.candle({ coin: "BTC", interval: "1m" }, resolve);
        }),
        90_000,
    );

    schemaCoverage(MethodReturnType, [data]);
});
