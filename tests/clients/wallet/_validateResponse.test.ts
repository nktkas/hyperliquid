import { privateKeyToAccount } from "npm:viem@^2.21.54/accounts";
import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { ApiRequestError, HttpTransport, ExchangeClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

Deno.test("_validateResponse", async (t) => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("CancelResponse", async () => {
        await assertRejects(
            () => exchClient.cancel({ cancels: [{ a: 0, o: 0 }] }),
            ApiRequestError,
            "Cannot process API request: Order 0 failed: Order was never placed, already canceled, or filled.",
        );
    });

    await t.step("ErrorResponse", async () => {
        await assertRejects(
            () => exchClient.scheduleCancel({ time: 1 }),
            ApiRequestError,
            "Cannot process API request: Scheduled cancel time too early, must be at least 5 seconds from now.",
        );
    });

    await t.step("OrderResponse", async () => {
        await assertRejects(
            () =>
                exchClient.order({
                    orders: [{ a: 0, b: true, p: "0", s: "0", r: false, t: { limit: { tif: "Gtc" } } }],
                    grouping: "na",
                }),
            ApiRequestError,
            "Cannot process API request: Order 0 failed: Order has zero size.",
        );
    });

    await t.step("TwapCancelResponse", async () => {
        await assertRejects(
            () => exchClient.twapOrder({ a: 0, b: true, s: "0", r: false, m: 5, t: false }),
            ApiRequestError,
            "Cannot process API request: Order has zero size.",
        );
    });

    await t.step("TwapOrderResponse", async () => {
        await assertRejects(
            () => exchClient.twapOrder({ a: 0, b: true, s: "0", r: false, m: 5, t: false }),
            ApiRequestError,
            "Cannot process API request: Order has zero size.",
        );
    });
});
