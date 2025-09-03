import { WsAllMids } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("allMids", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsAllMids>((resolve) => {
                client.allMids(resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(WsAllMids, data);
});
