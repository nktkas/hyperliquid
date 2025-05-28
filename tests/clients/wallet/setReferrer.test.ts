import { generatePrivateKey, privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, ExchangeClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["setReferrer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("setReferrer", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // Preparing a temporary wallet
    const tempPrivKey = generatePrivateKey();
    const tempAccount = privateKeyToAccount(tempPrivKey);
    const tempExchClient = new ExchangeClient({ wallet: tempAccount, transport, isTestnet: true });
    await exchClient.usdSend({ destination: tempAccount.address, amount: "2" });

    // —————————— Test ——————————

    const data = await tempExchClient.setReferrer({ code: "TEST" });

    schemaCoverage(MethodReturnType, [data]);
});
