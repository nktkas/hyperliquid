import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { deadline } from "jsr:@std/async@1/deadline";
import { SubscriptionClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 } }) as Args<{ wait?: number }>;

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["activeAssetCtx"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("activeAssetCtx", async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const transport = new WebSocketTransport({ url: "wss://api.hyperliquid-testnet.xyz/ws" });
    await using subsClient = new SubscriptionClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check response 'WsActiveAssetCtx'
        deadline(
            new Promise((resolve) => {
                subsClient.activeAssetCtx({ coin: "BTC" }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.activeAssetCtx({ coin: "AXL" }, resolve);
            }),
            10_000,
        ),
        // Check response 'WsActiveSpotAssetCtx'
        deadline(
            new Promise((resolve) => {
                subsClient.activeAssetCtx({ coin: "@107" }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                subsClient.activeAssetCtx({ coin: "@27" }, resolve);
            }),
            10_000,
        ),
    ]);

    schemaCoverage(MethodReturnType, data);
});
