import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test("frontendOpenOrders", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("FrontendOpenOrder");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    const data = await client.frontendOpenOrders({ user: USER_ADDRESS });

    assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
    data.forEach((item) => assertJsonSchema(schema, item));

    await t.step("side", async (t) => {
        await t.step("some should be B", () => assert(data.some((item) => item.side === "B")));
        await t.step("some should be A", () => assert(data.some((item) => item.side === "A")));
    });

    // TODO: Couldn't find a 'children' field
    await t.step({ name: "children", fn: () => {}, ignore: true });

    await t.step("orderType", async (t) => {
        // TODO: Couldn't find a `Market` order
        await t.step({ name: "some orderType should be Market", fn: () => {}, ignore: true });

        await t.step(
            "some should be Limit",
            () => assert(data.some((item) => item.orderType === "Limit")),
        );
        await t.step(
            "some should be Stop Market",
            () => assert(data.some((item) => item.orderType === "Stop Market")),
        );
        await t.step(
            "some should be Stop Limit",
            () => assert(data.some((item) => item.orderType === "Stop Limit")),
        );

        // TODO: Couldn't find a `Scale` order
        await t.step({ name: "some should be Scale", fn: () => {}, ignore: true });

        // TODO: Couldn't find a `TWAP` order
        await t.step({ name: "some should be TWAP", fn: () => {}, ignore: true });
    });

    await t.step("tif", async (t) => {
        await t.step("some should be Gtc", () => assert(data.some((item) => item.tif === "Gtc")));
        await t.step("some should be Alo", () => assert(data.some((item) => item.tif === "Alo")));

        // TODO: Couldn't find a `Ioc` order
        await t.step({ name: "some should be Ioc", fn: () => {}, ignore: true });
    });

    await t.step("cloid", async (t) => {
        await t.step(
            "some should be a string",
            () => assert(data.some((item) => typeof item.cloid === "string")),
        );
        await t.step(
            "some should be null",
            () => assert(data.some((item) => item.cloid === null)),
        );
    });
});
