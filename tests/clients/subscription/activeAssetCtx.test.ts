import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("activeAssetCtx", "api", async (_t, client) => {
    const data = await Promise.all([
        // WsActiveAssetCtx
        deadline(
            new Promise<WsActiveAssetCtx | WsActiveSpotAssetCtx>((resolve) => {
                client.activeAssetCtx({ coin: "ETH" }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise<WsActiveAssetCtx | WsActiveSpotAssetCtx>((resolve) => {
                client.activeAssetCtx({ coin: "AXL" }, resolve);
            }),
            10_000,
        ),
        // WsActiveSpotAssetCtx
        deadline(
            new Promise<WsActiveAssetCtx | WsActiveSpotAssetCtx>((resolve) => {
                client.activeAssetCtx({ coin: "@107" }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise<WsActiveAssetCtx | WsActiveSpotAssetCtx>((resolve) => {
                client.activeAssetCtx({ coin: "@27" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(v.union([WsActiveAssetCtx, WsActiveSpotAssetCtx]), data);
});
