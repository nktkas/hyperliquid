import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("userNonFundingLedgerUpdates", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("UserNonFundingLedgerUpdates");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("required parameters", async (t) => {
        const data = await client.userNonFundingLedgerUpdates({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        });

        assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step(
            "type === deposit",
            () => assert(data.some((item) => item.delta.type === "deposit")),
        );
        await t.step(
            "type === accountClassTransfer",
            () => assert(data.some((item) => item.delta.type === "accountClassTransfer")),
        );
        await t.step(
            "type === internalTransfer",
            () => assert(data.some((item) => item.delta.type === "internalTransfer")),
        );
        await t.step(
            "type === spotTransfer",
            () => assert(data.find((item) => item.delta.type === "spotTransfer")),
        );
        await t.step(
            "type === withdraw",
            () => assert(data.find((item) => item.delta.type === "withdraw")),
        );
        await t.step(
            "type === vaultCreate",
            () => assert(data.find((item) => item.delta.type === "vaultCreate")),
        );
        await t.step(
            "type === vaultDistribution",
            () => assert(data.find((item) => item.delta.type === "vaultDistribution")),
        );
        await t.step(
            "type === subAccountTransfer",
            () => assert(data.find((item) => item.delta.type === "subAccountTransfer")),
        );
    });

    await t.step("required parameters + endTime", async (t) => {
        const data = await client.userNonFundingLedgerUpdates({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: Date.now(),
        });

        assert(Array.isArray(data), "Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step(
            "type === deposit",
            () => assert(data.find((item) => item.delta.type === "deposit")),
        );
        await t.step(
            "type === accountClassTransfer",
            () => assert(data.find((item) => item.delta.type === "accountClassTransfer")),
        );
        await t.step(
            "type === internalTransfer",
            () => assert(data.find((item) => item.delta.type === "internalTransfer")),
        );
        await t.step(
            "type === spotTransfer",
            () => assert(data.find((item) => item.delta.type === "spotTransfer")),
        );
        await t.step(
            "type === withdraw",
            () => assert(data.find((item) => item.delta.type === "withdraw")),
        );
        await t.step(
            "type === vaultCreate",
            () => assert(data.find((item) => item.delta.type === "vaultCreate")),
        );
        await t.step(
            "type === vaultDistribution",
            () => assert(data.find((item) => item.delta.type === "vaultDistribution")),
        );
        await t.step(
            "type === subAccountTransfer",
            () => assert(data.find((item) => item.delta.type === "subAccountTransfer")),
        );
    });
});
