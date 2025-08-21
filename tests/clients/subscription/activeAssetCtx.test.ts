import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["activeAssetCtx"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await Promise.all([
        // WsActiveAssetCtx
        deadline(
            new Promise((resolve) => {
                client.activeAssetCtx({ coin: "ETH" }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                client.activeAssetCtx({ coin: "AXL" }, resolve);
            }),
            10_000,
        ),
        // WsActiveSpotAssetCtx
        deadline(
            new Promise((resolve) => {
                client.activeAssetCtx({ coin: "@107" }, resolve);
            }),
            10_000,
        ),
        deadline(
            new Promise((resolve) => {
                client.activeAssetCtx({ coin: "@27" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(MethodReturnType, data);
}

runTest("activeAssetCtx", testFn, "api");
