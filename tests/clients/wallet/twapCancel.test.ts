import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { assertJsonSchema, getAssetData, isHex } from "../../utils.ts";
import { ApiRequestError, HttpTransport, PublicClient, WalletClient } from "../../../index.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";
if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${typeof TEST_PRIVATE_KEY}`);
}

Deno.test("twapCancel", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("TwapCancelResponseSuccess");

    // Create client
    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });
    const publicClient = new PublicClient({ transport });

    // Preparation
    const { id, universe, ctx } = await getAssetData(publicClient, TEST_ASSET);

    // Test
    await t.step("cancel twap order", async () => {
        const sz = new BigNumber(55) // USD (1 min = 10$, 5 min min)
            .div(ctx.markPx)
            .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
            .toString();

        const twapOrderResult = await walletClient.twapOrder({
            a: id,
            b: true,
            s: sz,
            r: false,
            m: 5,
            t: false,
        });
        const twapId = twapOrderResult.response.data.status.running.twapId;

        // Test
        const result = await walletClient.twapCancel({ a: id, t: twapId });
        assertJsonSchema(typeSchema, result);
    });

    await t.step("should reject twap cancel with invalid twap id", async () => {
        await assertRejects(
            async () => await walletClient.twapCancel({ a: id, t: 123 }),
            ApiRequestError,
            "TWAP was never placed",
        );
    });
});
