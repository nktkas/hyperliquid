import { HyperliquidInfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";
import type { Hex } from "viem";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("userFillsByTime", async (t) => {
    // Create HyperliquidInfoClient
    const client = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("UserFill");

    // Test
    await t.step("user + startTime", async (t) => {
        const data = await client.userFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        });

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

        await t.step(`liquidation !== undefined`, () => {
            assert(data.find((item) => item.liquidation), "Failed to verify type with 'liquidation'");
        });
    });

    await t.step("user + startTime + endTime", async (t) => {
        const data = await client.userFillsByTime({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: Date.now(),
        });

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

        await t.step(`liquidation !== undefined`, () => {
            assert(data.find((item) => item.liquidation), "Failed to verify type with 'liquidation'");
        });
    });
});
