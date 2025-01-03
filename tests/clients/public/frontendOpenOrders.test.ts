import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("frontendOpenOrders", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("FrontendOpenOrder");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const data = await client.frontendOpenOrders({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'side'", async (t) => {
                await t.step("some must be 'B'", () => assert(data.some((item) => item.side === "B")));
                await t.step("some must be 'A'", () => assert(data.some((item) => item.side === "A")));
            });

            // await t.step("Check key 'triggerPx'", async (t) => {
            //     await t.step("some must be a string", () => assert(data.some((item) => typeof item.triggerPx === "string")));
            //     await t.step("some must be null", () => assert(data.some((item) => item.side === null)));
            // });

            // Failed to find an order with `children.length > 0`
            await t.step({ name: "Check key 'children'", fn: () => {}, ignore: true });

            await t.step("Check key 'orderType'", async (t) => {
                // Failed to find an order with `orderType === Market`
                await t.step({ name: "some must be 'Market'", fn: () => {}, ignore: true });

                await t.step(
                    "some must be 'Limit'",
                    () => assert(data.some((item) => item.orderType === "Limit")),
                );
                await t.step(
                    "some must be 'Stop Market'",
                    () => assert(data.some((item) => item.orderType === "Stop Market")),
                );
                await t.step(
                    "some must be 'Stop Limit'",
                    () => assert(data.some((item) => item.orderType === "Stop Limit")),
                );

                // Failed to find an order with `orderType === Scale`
                await t.step({ name: "some must be 'Scale'", fn: () => {}, ignore: true });

                // Failed to find an order with `orderType === TWAP`
                await t.step({ name: "some must be 'TWAP'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'tif'", async (t) => {
                await t.step("some must be null", () => assert(data.some((item) => item.tif === null)));
                await t.step("some must be 'Gtc'", () => assert(data.some((item) => item.tif === "Gtc")));

                // Failed to find an order with `tif === Ioc`
                await t.step({ name: "some must be 'Ioc'", fn: () => {}, ignore: true });

                await t.step("some must be 'Alo'", () => assert(data.some((item) => item.tif === "Alo")));
            });

            await t.step("Check key 'cloid'", async (t) => {
                await t.step(
                    "some must be a string",
                    () => assert(data.some((item) => typeof item.cloid === "string")),
                );
                await t.step(
                    "some must be null",
                    () => assert(data.some((item) => item.cloid === null)),
                );
            });
        },
        ignore: !isMatchToScheme,
    });
});
