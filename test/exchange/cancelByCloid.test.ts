import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { BigNumber } from "npm:bignumber.js@^9.1.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";
import { ExchangeClient, type Hex, InfoClient, type Order } from "../../index.ts";
import { assertJsonSchema, getAssetData, getPxDecimals, recursiveTraversal } from "../utils.ts";

const TEST_PRIVATE_KEY = Deno.args[0];
const TEST_ASSET = Deno.args[1];

if (!isHex(TEST_PRIVATE_KEY)) {
    throw new Error(`Expected a hex string, but got ${TEST_PRIVATE_KEY}`);
}

Deno.test(
    "cancelByCloid",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create viem account
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);

        // Create hyperliquid clients
        const exchangeClient = new ExchangeClient(account, "https://api.hyperliquid-testnet.xyz/exchange", false);
        const infoClient = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/exchange.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("CancelResponse");

        // Get asset data
        const { id, universe, ctx } = await getAssetData(infoClient, TEST_ASSET);

        // Change leverage
        await exchangeClient.updateLeverage({
            asset: id,
            isCross: true,
            leverage: 10,
        });

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

        // Pre-test check
        const balance = await infoClient.clearinghouseState({ user: account.address });
        assert(
            new BigNumber(balance.withdrawable).isGreaterThanOrEqualTo("1500"),
            `Expected a balance greater than or equal to 1500 but got ${balance.withdrawable}`,
        );

        // Test
        await t.step("1 order", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 1 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("2 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 2 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("4 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 4 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("8 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 8 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("16 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 16 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("32 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 32 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("64 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 64 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("128 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 128 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("256 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 256 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("512 orders", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 512 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });

        await t.step("1000 orders (max)", async () => {
            // Preparation of orders
            const orders: Order[] = Array.from({ length: 1000 }, () => ({
                a: id,
                b: true,
                p: pxDown,
                s: sz,
                r: false,
                t: { limit: { tif: "Gtc" } },
                c: randomCloid(),
            }));

            const openOrderRes = await exchangeClient.order({ orders, grouping: "na" });

            const cancels = openOrderRes.response.data.statuses.map<
                Parameters<ExchangeClient["cancelByCloid"]>[0]["cancels"][0]
            >((o) => ({
                asset: id,
                cloid: "resting" in o ? o.resting.cloid! : o.filled.cloid!,
            }));

            // Test
            const result = await exchangeClient.cancelByCloid({ cancels });

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
        });
    },
);

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}

function randomCloid(): Hex {
    return `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
}
