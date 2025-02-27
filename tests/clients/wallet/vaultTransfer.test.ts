import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_VAULT_ADDRESS = Deno.args[3] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (!isHex(TEST_VAULT_ADDRESS)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_VAULT_ADDRESS}`);
}

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<WalletClient["vaultTransfer"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("vaultTransfer", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("Check 'isDeposit' argument", async (t) => {
        await t.step("isDeposit: false", async () => {
            const result = await walletClient.vaultTransfer({
                vaultAddress: TEST_VAULT_ADDRESS,
                isDeposit: false,
                usd: 5 * 1e6, // 5 USD minimum
            });

            assertJsonSchema(MethodReturnType, result);
        });

        await t.step("isDeposit: true", async () => {
            const result = await walletClient.vaultTransfer({
                vaultAddress: TEST_VAULT_ADDRESS,
                isDeposit: true,
                usd: 5 * 1e6, // 5 USD minimum
            });
            assertJsonSchema(MethodReturnType, result);
        });
    });
});
