import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { runTest } from "./_t.ts";

async function testFn(
    t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await t.step("CancelResponse", async () => {
        await assertRejects(
            () => client.exchange.cancel({ cancels: [{ a: 0, o: 0 }] }),
            ApiRequestError,
            "Order 0: Order was never placed, already canceled, or filled. asset=0",
        );
    });

    await t.step("ErrorResponse", async () => {
        await assertRejects(
            () => client.exchange.scheduleCancel({ time: 1 }),
            ApiRequestError,
            "Cannot set scheduled cancel time until",
        );
    });

    await t.step("OrderResponse", async () => {
        await assertRejects(
            () =>
                client.exchange.order({
                    orders: [{ a: 0, b: true, p: "0", s: "0", r: false, t: { limit: { tif: "Gtc" } } }],
                    grouping: "na",
                }),
            ApiRequestError,
            "Order 0: Order has zero size.",
        );
    });

    await t.step("TwapCancelResponse", async () => {
        await assertRejects(
            () =>
                client.exchange.twapOrder({
                    twap: {
                        a: 0,
                        b: true,
                        s: "0",
                        r: false,
                        m: 5,
                        t: false,
                    },
                }),
            ApiRequestError,
            "Order has zero size.",
        );
    });

    await t.step("TwapOrderResponse", async () => {
        await assertRejects(
            () =>
                client.exchange.twapOrder({
                    twap: {
                        a: 0,
                        b: true,
                        s: "0",
                        r: false,
                        m: 5,
                        t: false,
                    },
                }),
            ApiRequestError,
            "Order has zero size.",
        );
    });
}

runTest("_validateResponse", testFn);
