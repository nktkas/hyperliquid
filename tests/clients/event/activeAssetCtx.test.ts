import { deadline } from "jsr:@std/async@^1.0.10/deadline";
import { SubscriptionClient, WebSocketTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["activeAssetCtx"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("activeAssetCtx", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

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
