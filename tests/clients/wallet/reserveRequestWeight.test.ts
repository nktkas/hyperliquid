import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, ExchangeClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["reserveRequestWeight"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("reserveRequestWeight", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check response 'success'
        exchClient.reserveRequestWeight({ weight: 1 }),
        // Check argument 'expiresAfter'
        exchClient.reserveRequestWeight({ weight: 1, expiresAfter: Date.now() + 1000 * 60 * 60 }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
