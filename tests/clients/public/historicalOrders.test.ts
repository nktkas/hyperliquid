import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { assert } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Constants ——————————

const USER_ADDRESS = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["historicalOrders"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("historicalOrders", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await client.historicalOrders({ user: USER_ADDRESS });

    const isMatchToScheme = await t.step("Matching data to type schema", () => {
        assertJsonSchema(MethodReturnType, data, { skipMinItemsCheck: ["children"] });
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check key 'status'", async (t) => {
                await t.step("some should be 'filled'", () => {
                    assert(data.some((item) => item.status === "filled"));
                });
                await t.step("some should be 'open'", () => {
                    assert(data.some((item) => item.status === "open"));
                });
                await t.step("some should be 'canceled'", () => {
                    assert(data.some((item) => item.status === "canceled"));
                });
                await t.step("some should be 'triggered'", () => {
                    assert(data.some((item) => item.status === "triggered"));
                });
                await t.step("some should be 'rejected'", () => {
                    assert(data.some((item) => item.status === "rejected"));
                });

                // Failed to find an order with 'order.status === triggered'
                await t.step({ name: "some should be 'triggered'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === marginCanceled'
                await t.step({ name: "some should be 'marginCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === vaultWithdrawalCanceled'
                await t.step({ name: "some should be 'vaultWithdrawalCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === openInterestCapCanceled'
                await t.step({ name: "some should be 'openInterestCapCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === selfTradeCanceled'
                await t.step({ name: "some should be 'selfTradeCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === reduceOnlyCanceled'
                await t.step({ name: "some should be 'reduceOnlyCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === siblingFilledCanceled'
                await t.step({ name: "some should be 'siblingFilledCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === delistedCanceled'
                await t.step({ name: "some should be 'delistedCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === liquidatedCanceled'
                await t.step({ name: "some should be 'liquidatedCanceled'", fn: () => {}, ignore: true });

                // Failed to find an order with 'order.status === scheduledCancel'
                await t.step({ name: "some should be 'scheduledCancel'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'order.side'", async (t) => {
                await t.step("some should be 'B'", () => {
                    assert(data.some((item) => item.order.side === "B"));
                });
                await t.step("some should be 'A'", () => {
                    assert(data.some((item) => item.order.side === "A"));
                });
            });

            // FIXME: Failed to find an open order with 'children.length > 0'
            await t.step({ name: "Check key 'order.children'", fn: () => {}, ignore: true });

            await t.step("Check key 'order.orderType'", async (t) => {
                await t.step("some should be 'Limit'", () => {
                    assert(data.some((item) => item.order.orderType === "Limit"));
                });
                await t.step("some should be 'Stop Market'", () => {
                    assert(data.some((item) => item.order.orderType === "Stop Market"));
                });
                await t.step("some should be 'Stop Limit'", () => {
                    assert(data.some((item) => item.order.orderType === "Stop Limit"));
                });

                // FIXME: Failed to find an open order with 'orderType === Market'
                await t.step({ name: "some should be 'Market'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'order.tif'", async (t) => {
                await t.step("some should be 'Gtc'", () => {
                    assert(data.some((item) => item.order.tif === "Gtc"));
                });
                await t.step("some should be 'Alo'", () => {
                    assert(data.some((item) => item.order.tif === "Alo"));
                });
                await t.step("some should be 'null'", () => {
                    assert(data.some((item) => item.order.tif === null));
                });

                // FIXME: Failed to find an open order with 'tif === Ioc / FrontendMarket / LiquidationMarket'
                await t.step({ name: "some should be 'Ioc'", fn: () => {}, ignore: true });
                await t.step({ name: "some should be 'FrontendMarket'", fn: () => {}, ignore: true });
                await t.step({ name: "some should be 'LiquidationMarket'", fn: () => {}, ignore: true });
            });

            await t.step("Check key 'order.cloid'", async (t) => {
                await t.step("some should be a 'string'", () => {
                    assert(data.some((item) => typeof item.order.cloid === "string"));
                });
                await t.step("some should be 'null'", () => {
                    assert(data.some((item) => item.order.cloid === null));
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
