import { WsBlockDetails } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("explorerBlock", "rpc", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsBlockDetails[]>((resolve) => {
                client.explorerBlock(resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(v.array(WsBlockDetails), data);
});
