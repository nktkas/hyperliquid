import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { string: ["privateKey"] }) as Args<{ wait?: number; privateKey: Hex }>;

const PRIVATE_KEY = args.privateKey;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["scheduleCancel"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("scheduleCancel", async () => {
    if (args.wait) await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check argument 'time' + argument 'expiresAfter'
        exchClient.scheduleCancel({ time: Date.now() + 10000 }),
        exchClient.scheduleCancel({ expiresAfter: Date.now() + 1000 * 60 * 60 }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
