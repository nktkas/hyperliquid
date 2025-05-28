import { HttpTransport, InfoClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<InfoClient["l2Book"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("l2Book", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const infoClient = new InfoClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        infoClient.l2Book({ coin: "ETH" }),
        // Check argument 'nSigFigs'
        infoClient.l2Book({ coin: "ETH", nSigFigs: 2 }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: 3 }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: 4 }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: 5 }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: null }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: undefined }),
        // Check argument 'mantissa'
        infoClient.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: null }),
        infoClient.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: undefined }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
