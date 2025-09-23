// deno-lint-ignore-file no-import-prefix
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "_validateResponse",
  codeTestFn: async (t, client) => {
    await t.step("CancelResponse", async () => {
      await assertRejects(
        async () => {
          await client.exchange.cancel({ cancels: [{ a: 0, o: 0 }] });
        },
        ApiRequestError,
        "Order 0: Order was never placed, already canceled, or filled. asset=0",
      );
    });

    await t.step("ErrorResponse", async () => {
      await assertRejects(
        async () => {
          await client.exchange.scheduleCancel({ time: 1 });
        },
        ApiRequestError,
        "Cannot set scheduled cancel time until",
      );
    });

    await t.step("OrderResponse", async () => {
      await assertRejects(
        async () => {
          await client.exchange.order({
            orders: [{ a: 0, b: true, p: "0", s: "0", r: false, t: { limit: { tif: "Gtc" } } }],
            grouping: "na",
          });
        },
        ApiRequestError,
        "Order 0: Order has zero size.",
      );
    });

    await t.step("TwapCancelResponse", async () => {
      await assertRejects(
        async () => {
          await client.exchange.twapOrder({
            twap: {
              a: 0,
              b: true,
              s: "0",
              r: false,
              m: 5,
              t: false,
            },
          });
        },
        ApiRequestError,
        "Order has zero size.",
      );
    });

    await t.step("TwapOrderResponse", async () => {
      await assertRejects(
        async () => {
          await client.exchange.twapOrder({
            twap: {
              a: 0,
              b: true,
              s: "0",
              r: false,
              m: 5,
              t: false,
            },
          });
        },
        ApiRequestError,
        "Order has zero size.",
      );
    });
  },
});
