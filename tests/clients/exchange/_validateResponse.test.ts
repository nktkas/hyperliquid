import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;

// —————————— Test ——————————

Deno.test("_validateResponse", { ignore: !PRIVATE_KEY }, async (t) => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("CancelResponse", async () => {
        await assertRejects(
            () => exchClient.cancel({ cancels: [{ a: 0, o: 0 }] }),
            ApiRequestError,
            "Order 0: Order was never placed, already canceled, or filled. asset=0",
        );
    });

    await t.step("ErrorResponse", async () => {
        await assertRejects(
            () => exchClient.scheduleCancel({ time: 1 }),
            ApiRequestError,
            "Scheduled cancel time too early, must be at least 5 seconds from now.",
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
            "Order 0: Order has zero size.",
        );
    });

    await t.step("TwapCancelResponse", async () => {
        await assertRejects(
            () => exchClient.twapOrder({ a: 0, b: true, s: "0", r: false, m: 5, t: false }),
            ApiRequestError,
            "Order has zero size.",
        );
    });

    await t.step("TwapOrderResponse", async () => {
        await assertRejects(
            () => exchClient.twapOrder({ a: 0, b: true, s: "0", r: false, m: 5, t: false }),
            ApiRequestError,
            "Order has zero size.",
        );
    });
});
