import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const VAULT_ADDRESS = Deno.args[2] as `0x${string}`;

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["vaultModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultModify", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check without arguments
        walletClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: null,
            alwaysCloseOnWithdraw: null,
        }),
        // Check argument 'allowDeposits'
        walletClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: true,
            alwaysCloseOnWithdraw: null,
        }),
        walletClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: false,
            alwaysCloseOnWithdraw: null,
        }),
        // Check argument 'alwaysCloseOnWithdraw'
        walletClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: null,
            alwaysCloseOnWithdraw: true,
        }),
        walletClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: null,
            alwaysCloseOnWithdraw: false,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
