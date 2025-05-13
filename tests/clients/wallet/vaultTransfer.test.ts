import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const VAULT_ADDRESS = "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["vaultTransfer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultTransfer", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    // Check argument 'isDeposit' + argument 'expiresAfter'
    const data1 = await walletClient.vaultTransfer({
        vaultAddress: VAULT_ADDRESS,
        isDeposit: false,
        usd: 5 * 1e6,
    });
    const data2 = await walletClient.vaultTransfer({
        vaultAddress: VAULT_ADDRESS,
        isDeposit: true,
        usd: 5 * 1e6,
        expiresAfter: Date.now() + 1000 * 60 * 60,
    });

    schemaCoverage(MethodReturnType, [data1, data2]);
});
