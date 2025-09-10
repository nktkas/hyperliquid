// deno-lint-ignore-file no-import-prefix
import { WsUserFills } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userFills", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsUserFills>((resolve) => {
                client.userFills({ user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(WsUserFills, data, {
        ignoreDefinedTypes: ["#/properties/fills/items/properties/liquidation"],
        ignoreBranches: {
            "#/properties/fills/items/properties/twapId": [0],
        },
        ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
});
