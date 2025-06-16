import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey, privateKeyToAddress } from "npm:viem@2/accounts";
import { ExchangeClient, type Hex, HttpTransport, MultiSignClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["convertToMultiSigUser"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("convertToMultiSigUser", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: PRIVATE_KEY, transport, isTestnet: true });

    // Preparing a temporary wallet
    const tempExchClient = new ExchangeClient({ wallet: generatePrivateKey(), transport, isTestnet: true });
    const tempMultiSignClient = new MultiSignClient({
        transport,
        multiSignAddress: privateKeyToAddress(tempExchClient.wallet),
        signers: [PRIVATE_KEY],
        isTestnet: true,
    });
    await exchClient.usdSend({ destination: privateKeyToAddress(tempExchClient.wallet), amount: "2" });

    // —————————— Test ——————————

    const data1 = await tempExchClient.convertToMultiSigUser({
        authorizedUsers: [privateKeyToAddress(exchClient.wallet)],
        threshold: 1,
    });
    const data2 = await tempMultiSignClient.convertToMultiSigUser(null);

    schemaCoverage(MethodReturnType, [data1, data2]);
});
