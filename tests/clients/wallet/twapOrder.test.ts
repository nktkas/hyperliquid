import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertJsonSchema, formatSize, getAssetData, isHex } from "../../utils.ts";
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

export type MethodReturnType = ReturnType<WalletClient["twapOrder"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("twapOrder", async () => {
    // —————————— Prepare ——————————

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    const { id, universe, ctx } = await getAssetData(publicClient, TEST_PERPS_ASSET);
    const sz = formatSize(new BigNumber(55).div(ctx.markPx), universe.szDecimals);

    // —————————— Test ——————————
    const result = await walletClient.twapOrder({
        a: id,
        b: true,
        s: sz,
        r: false,
        m: 5,
        t: false,
    });
    assertJsonSchema(MethodReturnType, result);

    // —————————— Cleanup ——————————

    const twapId = result.response.data.status.running.twapId;
    await walletClient.twapCancel({ a: id, t: twapId });
});
