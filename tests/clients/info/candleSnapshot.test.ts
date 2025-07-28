import type { InfoClient } from "../../../mod.ts";
import { schemaCoverage, schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<InfoClient["candleSnapshot"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(_t: Deno.TestContext, client: InfoClient) {
    const data = await client.candleSnapshot({
        coin: "BTC",
        interval: "15m",
        startTime: Date.now() - 1000 * 60 * 60 * 24,
    });
    schemaCoverage(MethodReturnType, [data], {
        ignoreEnumValuesByPath: {
            "#/items/properties/i": [
                "1m",
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

runTest("candleSnapshot", testFn);
