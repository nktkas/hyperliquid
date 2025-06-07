import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { generatePrivateKey, privateKeyToAccount } from "npm:viem@2/accounts";
import { ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";
import { MultiSignClient } from "../../../src/clients/multiSign.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const MULTI_SIGN_ADDRESS = "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83"; // Replace with your MultiSign address

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<MultiSignClient["convertToMultiSigUser"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("convertToMultiSigUser", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const multiSignClient = new MultiSignClient({
        transport,
        multiSignAddress: MULTI_SIGN_ADDRESS,
        signers: [account],
        isTestnet: true,
    });

    // Preparing a temporary wallet
    const tempPrivKey = generatePrivateKey();
    const tempAccount = privateKeyToAccount(tempPrivKey);
    const tempExchClient = new ExchangeClient({ wallet: tempAccount, transport, isTestnet: true });
    await multiSignClient.usdSend({ destination: tempAccount.address, amount: "2" });

    // —————————— Test ——————————

    const data = await tempExchClient.convertToMultiSigUser({
        authorizedUsers: [MULTI_SIGN_ADDRESS],
        threshold: 1,
    });

    schemaCoverage(MethodReturnType, [data]);
});
