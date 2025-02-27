import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, getAssetData, isHex } from "../../utils.ts";
import { HttpTransport, PublicClient, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;
const TEST_PERPS_ASSET = Deno.args[1] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}
if (typeof TEST_PERPS_ASSET !== "string") {
    throw new Error(`Expected a string, but got ${typeof TEST_PERPS_ASSET}`);
}

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<WalletClient["updateLeverage"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("updateLeverage", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id } = await getAssetData(publicClient, TEST_PERPS_ASSET);

    // —————————— Test ——————————

    await t.step("Check 'isCross' argument", async (t) => {
        await t.step("isCross: true", async () => {
            const result = await walletClient.updateLeverage({ asset: id, isCross: true, leverage: 1 });
            assertJsonSchema(MethodReturnType, result);
        });

        await t.step("isCross: false", async () => {
            const result = await walletClient.updateLeverage({ asset: id, isCross: false, leverage: 1 });
            assertJsonSchema(MethodReturnType, result);
        });
    });
});
