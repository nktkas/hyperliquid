import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertRejects } from "jsr:@std/assert@^1.0.10";
import { HttpRequestError, HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("l2Book", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("L2Book");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.l2Book({ coin: "ETH" });
        assertJsonSchema(typeSchema, data);
        assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
        assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
        assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check argument 'nSigFigs'", async (t) => {
                await t.step("nSigFigs === 2", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
                    assertJsonSchema(typeSchema, data);
                    assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
                    assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
                    assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
                });
                await t.step("nSigFigs === 3", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 3 });
                    assertJsonSchema(typeSchema, data);
                    assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
                    assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
                    assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
                });
                await t.step("nSigFigs === 4", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 4 });
                    assertJsonSchema(typeSchema, data);
                    assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
                    assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
                    assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
                });
                await t.step("nSigFigs === 5", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5 });
                    assertJsonSchema(typeSchema, data);
                    assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
                    assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
                    assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
                });
            });

            await t.step("Check argument 'nSigFigs' + 'mantissa'", async (t) => {
                await t.step("mantissa === 1 (server must return error)", async () => {
                    await assertRejects(
                        // @ts-ignore - Check what doesn't work
                        () => client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 1 }),
                        HttpRequestError,
                        "500 Internal Server Error",
                    );
                });
                await t.step("mantissa === 2", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 });
                    assertJsonSchema(typeSchema, data);
                    assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
                    assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
                    assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
                });
                await t.step("mantissa === 5", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 });
                    assertJsonSchema(typeSchema, data);
                    assert(data.levels.length === 2, "'levels' must have 2 elements, but got: " + data.levels.length);
                    assert(data.levels[0].length > 0, "'levels[0]' must be a non-empty array");
                    assert(data.levels[1].length > 0, "'levels[1]' must be a non-empty array");
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
