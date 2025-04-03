import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["candleSnapshot"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("candleSnapshot", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
        }),
        // Check argument 'endTime'
        client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: Date.now(),
        }),
        client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: null,
        }),
        client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: undefined,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
