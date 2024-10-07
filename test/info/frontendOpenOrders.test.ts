import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "frontendOpenOrders",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("FrontendOpenOrder");

        // Test
        const data = await client.frontendOpenOrders({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("side === B", () => {
                assert(data.find((item) => item.side === "B"));
            });

            await t.step("side === A", () => {
                assert(data.find((item) => item.side === "A"));
            });
        });

        // TODO: Couldn't find a 'children' field
        await t.step({ name: "children", fn: () => {}, ignore: true });

        await t.step("orderType", async (t) => {
            // TODO: Couldn't find a `Market` order
            await t.step({ name: "orderType === Market", fn: () => {}, ignore: true });

            await t.step("orderType === Limit", () => {
                assert(data.find((item) => item.orderType === "Limit"));
            });

            await t.step("orderType === Stop Market", () => {
                assert(data.find((item) => item.orderType === "Stop Market"));
            });

            await t.step("orderType === Stop Limit", () => {
                assert(data.find((item) => item.orderType === "Stop Limit"));
            });

            // TODO: Couldn't find a `Scale` order
            await t.step({ name: "orderType === Scale", fn: () => {}, ignore: true });

            // TODO: Couldn't find a `TWAP` order
            await t.step({ name: "orderType === TWAP", fn: () => {}, ignore: true });
        });

        await t.step("tif", async (t) => {
            await t.step("tif === Gtc", () => {
                assert(data.find((item) => item.tif === "Gtc"));
            });

            // TODO: Couldn't find a `Ioc` order
            await t.step({ name: "tif === Ioc", fn: () => {}, ignore: true });

            await t.step("tif === Alo", () => {
                assert(data.find((item) => item.tif === "Alo"));
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("typeof cloid === string", () => {
                assert(data.find((item) => typeof item.cloid === "string"));
            });

            await t.step("cloid === null", () => {
                assert(data.find((item) => item.cloid === null));
            });
        });
    },
);
