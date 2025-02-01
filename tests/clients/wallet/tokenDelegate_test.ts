import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { assertJsonSchema, isHex } from "../../utils.ts";
import { HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const TEST_PRIVATE_KEY = Deno.args[0] as string | undefined;

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<WalletClient["tokenDelegate"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("tokenDelegate", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("undelegate", async () => {
        const result = await walletClient.tokenDelegate({
            validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
            wei: 1,
            isUndelegate: true,
        });
        assertJsonSchema(MethodReturnType, result);
    });

    await t.step("delegate", async () => {
        const result = await walletClient.tokenDelegate({
            validator: "0xa012b9040d83c5cbad9e6ea73c525027b755f596",
            wei: 1,
            isUndelegate: false,
        });
        assertJsonSchema(MethodReturnType, result);
    });
});
