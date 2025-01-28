import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["frontendOpenOrders"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("frontendOpenOrders", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.frontendOpenOrders({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'side'", async (t) => {
                await t.step("some should be 'B'", () => {
                    assert(data.some((item) => item.side === "B"));
                });
                await t.step("some should be 'A'", () => {
                    assert(data.some((item) => item.side === "A"));
                });
            });

            // FIXME: Failed to find an open order with 'children.length > 0'
            await t.step({ name: "Check key 'children'", fn: () => {}, ignore: true });

            await t.step("Check key 'orderType'", async (t) => {
                await t.step("some should be 'Limit'", () => {
                    assert(data.some((item) => item.orderType === "Limit"));
                });
                await t.step("some should be 'Stop Market'", () => {
                    assert(data.some((item) => item.orderType === "Stop Market"));
                });
                await t.step("some should be 'Stop Limit'", () => {
                    assert(data.some((item) => item.orderType === "Stop Limit"));
                });

                // FIXME: Failed to find an open order with 'orderType === Market'
                await t.step({ name: "some should be 'Market'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'tif'", async (t) => {
                await t.step("some should be 'Gtc'", () => {
                    assert(data.some((item) => item.tif === "Gtc"));
                });
                await t.step("some should be 'Alo'", () => {
                    assert(data.some((item) => item.tif === "Alo"));
                });
                await t.step("some should be 'null'", () => {
                    assert(data.some((item) => item.tif === null));
                });

                // FIXME: Failed to find an open order with 'tif === Ioc / FrontendMarket / LiquidationMarket'
                await t.step({ name: "some should be 'Ioc'", fn: () => {}, ignore: true });
                await t.step({ name: "some should be 'FrontendMarket'", fn: () => {}, ignore: true });
                await t.step({ name: "some should be 'LiquidationMarket'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'cloid'", async (t) => {
                await t.step("some should be a 'string'", () => {
                    assert(data.some((item) => typeof item.cloid === "string"));
                });
                await t.step("some should be 'null'", () => {
                    assert(data.some((item) => item.cloid === null));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
