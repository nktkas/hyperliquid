import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import { SubscriptionClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["l2Book"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("l2Book", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using subsClient = new SubscriptionClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check without arguments
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC" }, resolve);
            }),
            10_000,
        ),
        // Check argument 'nSigFigs'
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC", nSigFigs: 2 }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC", nSigFigs: 3 }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC", nSigFigs: 4 }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC", nSigFigs: 5 }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC", nSigFigs: null }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book({ coin: "BTC", nSigFigs: undefined }, resolve);
            }),
            10_000,
        ),
        // Check argument 'mantissa'
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book(
                    { coin: "BTC", nSigFigs: 5, mantissa: 2 },
                    resolve,
                );
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book(
                    { coin: "BTC", nSigFigs: 5, mantissa: 5 },
                    resolve,
                );
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book(
                    { coin: "BTC", nSigFigs: 5, mantissa: null },
                    resolve,
                );
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.l2Book(
                    { coin: "BTC", nSigFigs: 5, mantissa: undefined },
                    resolve,
                );
            }),
            10_000,
        ),
    ]);

    schemaCoverage(MethodReturnType, data);
});
