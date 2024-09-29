import { type Hex, HyperliquidInfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("userNonFundingLedgerUpdates", async (t) => {
    // Create HyperliquidInfoClient
    const client = new HyperliquidInfoClient("https://api.hyperliquid-testnet.xyz/info");

    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("UserNonFundingLedgerUpdates");

    // Test
    await t.step("user + startTime", async (t) => {
        const data = await client.userNonFundingLedgerUpdates({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });

        await t.step("deposit", () => {
            assert(
                data.find((item) => item.delta.type === "deposit"),
                "Failed to verify type with 'delta.type' === 'deposit'",
            );
        });

        await t.step("accountClassTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "accountClassTransfer"),
                "Failed to verify type with 'delta.type' === 'accountClassTransfer'",
            );
        });

        await t.step("internalTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "internalTransfer"),
                "Failed to verify type with 'delta.type' === 'internalTransfer'",
            );
        });

        await t.step("spotTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "spotTransfer"),
                "Failed to verify type with 'delta.type' === 'spotTransfer'",
            );
        });

        await t.step("withdraw", () => {
            assert(
                data.find((item) => item.delta.type === "withdraw"),
                "Failed to verify type with 'delta.type' === 'withdraw'",
            );
        });

        await t.step("vaultCreate", () => {
            assert(
                data.find((item) => item.delta.type === "vaultCreate"),
                "Failed to verify type with 'delta.type' === 'vaultCreate'",
            );
        });

        await t.step("vaultDistribution", () => {
            assert(
                data.find((item) => item.delta.type === "vaultDistribution"),
                "Failed to verify type with 'delta.type' === 'vaultDistribution'",
            );
        });

        await t.step("subAccountTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "subAccountTransfer"),
                "Failed to verify type with 'delta.type' === 'subAccountTransfer'",
            );
        });
    });

    await t.step("user + startTime + endTime", async (t) => {
        const data = await client.userNonFundingLedgerUpdates({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: Date.now(),
        });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });

        await t.step("deposit", () => {
            assert(
                data.find((item) => item.delta.type === "deposit"),
                "Failed to verify type with 'delta.type' === 'deposit'",
            );
        });

        await t.step("accountClassTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "accountClassTransfer"),
                "Failed to verify type with 'delta.type' === 'accountClassTransfer'",
            );
        });

        await t.step("internalTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "internalTransfer"),
                "Failed to verify type with 'delta.type' === 'internalTransfer'",
            );
        });

        await t.step("spotTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "spotTransfer"),
                "Failed to verify type with 'delta.type' === 'spotTransfer'",
            );
        });

        await t.step("withdraw", () => {
            assert(
                data.find((item) => item.delta.type === "withdraw"),
                "Failed to verify type with 'delta.type' === 'withdraw'",
            );
        });

        await t.step("vaultCreate", () => {
            assert(
                data.find((item) => item.delta.type === "vaultCreate"),
                "Failed to verify type with 'delta.type' === 'vaultCreate'",
            );
        });

        await t.step("vaultDistribution", () => {
            assert(
                data.find((item) => item.delta.type === "vaultDistribution"),
                "Failed to verify type with 'delta.type' === 'vaultDistribution'",
            );
        });

        await t.step("subAccountTransfer", () => {
            assert(
                data.find((item) => item.delta.type === "subAccountTransfer"),
                "Failed to verify type with 'delta.type' === 'subAccountTransfer'",
            );
        });
    });
});
