import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@2/accounts";
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

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // Preparing a temporary wallet
    const tempPrivKey = generatePrivateKey();
    const tempAccount = privateKeyToAccount(tempPrivKey);
    const tempExchClient = new ExchangeClient({ wallet: tempAccount, transport, isTestnet: true });
    const tempMultiSignClient = new MultiSignClient({
        transport,
        multiSignAddress: tempAccount.address,
        signers: [account],
        isTestnet: true,
    });
    await exchClient.usdSend({ destination: tempAccount.address, amount: "2" });

    // —————————— Test ——————————

    const data1 = await tempExchClient.convertToMultiSigUser({
        authorizedUsers: [exchClient.wallet.address],
        threshold: 1,
    });
    const data2 = await tempMultiSignClient.convertToMultiSigUser(null);

    schemaCoverage(MethodReturnType, [data1, data2]);
});
