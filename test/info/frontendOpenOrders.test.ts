import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "frontendOpenOrders",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create HyperliquidInfoClient
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("FrontendOpenOrder");

        // Test
        const data = await client.frontendOpenOrders({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("B", () => {
                assert(data.find((item) => item.side === "B"), "Failed to verify type with 'side' === 'B'");
            });

            await t.step("A", () => {
                assert(data.find((item) => item.side === "A"), "Failed to verify type with 'side' === 'A'");
            });
        });

        await t.step(`cloid !== undefined`, () => {
            assert(data.find((item) => item.cloid), "Failed to verify type with 'cloid'");
        });

        await t.step("orderType", async (t) => {
            // TODO: Couldn't find a `Market` order
            await t.step({ name: "Market", fn: () => {}, ignore: true });

            await t.step("Limit", () => {
                assert(data.find((item) => item.orderType === "Limit"), "Failed to verify type with 'orderType' === 'Limit'");
            });

            await t.step("Stop Market", () => {
                assert(
                    data.find((item) => item.orderType === "Stop Market"),
                    "Failed to verify type with 'orderType' === 'Stop Market'",
                );
            });

            await t.step("Stop Limit", () => {
                assert(
                    data.find((item) => item.orderType === "Stop Limit"),
                    "Failed to verify type with 'orderType' === 'Stop Limit'",
                );
            });

            // TODO: Couldn't find a `Scale` order
            await t.step({ name: "Scale", fn: () => {}, ignore: true });

            // TODO: Couldn't find a `TWAP` order
            await t.step({ name: "TWAP", fn: () => {}, ignore: true });
        });

        await t.step("tif", async (t) => {
            await t.step("Gtc", () => {
                assert(data.find((item) => item.tif === "Gtc"), "Failed to verify type with 'tif' === 'Gtc'");
            });

            // TODO: Couldn't find a `Ioc` order
            await t.step({ name: "Ioc", fn: () => {}, ignore: true });

            await t.step("Alo", () => {
                assert(data.find((item) => item.tif === "Alo"), "Failed to verify type with 'tif' === 'Alo'");
            });
        });

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                if (key === "children") return;
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    },
);
