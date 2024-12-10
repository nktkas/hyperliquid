import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("userFunding", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("UserFunding");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    await t.step("required parameters", async (t) => {
        const data = await client.userFunding({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        });

        assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("nSamples", async (t) => {
            await t.step(
                "some should be number",
                () => assert(data.some((item) => typeof item.delta.nSamples === "number")),
            );
            await t.step(
                "some should be null",
                () => assert(data.some((item) => item.delta.nSamples === null)),
            );
        });
    });

    await t.step("required parameters + endTime", async (t) => {
        const data = await client.userFunding({
            user: USER_ADDRESS,
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            endTime: Date.now(),
        });

        assert(Array.isArray(data), "Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("nSamples", async (t) => {
            await t.step(
                "some should be number",
                () => assert(data.some((item) => typeof item.delta.nSamples === "number")),
            );
            await t.step(
                "some should be null",
                () => assert(data.some((item) => item.delta.nSamples === null)),
            );
        });
    });
});
