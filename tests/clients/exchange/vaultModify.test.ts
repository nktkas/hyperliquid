import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const VAULT_ADDRESS = "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["vaultModify"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultModify", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check without arguments
        exchClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: null,
            alwaysCloseOnWithdraw: null,
        }),
        // Check argument 'allowDeposits'
        exchClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: true,
            alwaysCloseOnWithdraw: null,
        }),
        exchClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: false,
            alwaysCloseOnWithdraw: null,
        }),
        // Check argument 'alwaysCloseOnWithdraw'
        exchClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: null,
            alwaysCloseOnWithdraw: true,
        }),
        exchClient.vaultModify({
            vaultAddress: VAULT_ADDRESS,
            allowDeposits: null,
            alwaysCloseOnWithdraw: false,
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
