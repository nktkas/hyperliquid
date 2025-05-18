import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["convertToMultiSigUser"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("convertToMultiSigUser", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // Preparing a temporary wallet
    const tempPrivKey = generatePrivateKey();
    const tempAccount = privateKeyToAccount(tempPrivKey);
    const tempWalletClient = new WalletClient({ wallet: tempAccount, transport, isTestnet: true });
    await walletClient.usdSend({ destination: tempAccount.address, amount: "2" });

    // —————————— Test ——————————

    const data = await tempWalletClient.convertToMultiSigUser({
        authorizedUsers: ["0xe019d6167E7e324aEd003d94098496b6d986aB05"],
        threshold: 1,
    });

    schemaCoverage(MethodReturnType, [data]);
});
