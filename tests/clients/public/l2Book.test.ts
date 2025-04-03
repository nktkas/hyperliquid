import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["l2Book"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("l2Book", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.l2Book({ coin: "ETH" }),
        // Check argument 'nSigFigs'
        client.l2Book({ coin: "ETH", nSigFigs: 2 }),
        client.l2Book({ coin: "ETH", nSigFigs: 3 }),
        client.l2Book({ coin: "ETH", nSigFigs: 4 }),
        client.l2Book({ coin: "ETH", nSigFigs: 5 }),
        client.l2Book({ coin: "ETH", nSigFigs: null }),
        client.l2Book({ coin: "ETH", nSigFigs: undefined }),
        // Check argument 'mantissa'
        client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 }),
        client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 }),
        client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: null }),
        client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: undefined }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
