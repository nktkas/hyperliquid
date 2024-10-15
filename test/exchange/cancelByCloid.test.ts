import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assertGreater } from "jsr:@std/assert@^1.0.4";
import { ExchangeClient, InfoClient } from "../../index.ts";
import { assertJsonSchema, getAssetData, getPxDecimals, isHex, randomCloid, recursiveTraversal } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = "ETH";

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "cancelByCloid",
    { permissions: { net: true, read: true } },
    async () => {
        // Create client
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);
        const infoClient = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/exchange.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("CancelResponseSuccess");

        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

        // Calculations
        const pxDecimals = getPxDecimals("perp", universe.szDecimals);
        const pxDown = new BigNumber(ctx.markPx)
            .times(0.99)
            .decimalPlaces(pxDecimals, BigNumber.ROUND_DOWN)
            .toString();
        const sz = new BigNumber(11) // USD
            .div(ctx.markPx)
            .decimalPlaces(universe.szDecimals, BigNumber.ROUND_DOWN)
            .toString();

        // Change leverage
        await exchangeClient.updateLeverage({
            asset: id,
            isCross: true,
            leverage: 10,
        });

        // Preparation of orders
        const openOrderRes = await exchangeClient.order({
            orders: [{
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }],
            grouping: "na",
        });
        const [order1] = openOrderRes.response.data.statuses;

        // Test
        const result = await exchangeClient.cancelByCloid({
            cancels: [{
                asset: id,
                cloid: "resting" in order1 ? order1.resting.cloid! : order1.filled.cloid!,
            }],
        });

        assertJsonSchema(schema, result);
        recursiveTraversal(result, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    },
);
