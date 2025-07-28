import { deadline } from "jsr:@std/async@1/deadline";
import type { SubscriptionClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Parameters<Parameters<SubscriptionClient["candle"]>[1]>[0];
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: SubscriptionClient) {
    const data = await deadline(
        new Promise((resolve) => {
            client.candle({ coin: "BTC", interval: "1m" }, resolve);
        }),
        120_000,
    );
    schemaCoverage(MethodReturnType, [data], {
        ignoreEnumValuesByPath: {
            "#/properties/i": [
                "3m",
                "5m",
                "15m",
                "30m",
                "1h",
                "2h",
                "4h",
                "8h",
                "12h",
                "1d",
                "3d",
                "1w",
                "1M",
            ],
        },
    });
}

runTest("candle", testFn, "api");
