import { WsUserTwapSliceFills } from "@nktkas/hyperliquid/schemas";
import { deadline } from "jsr:@std/async@1/deadline";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest("userTwapSliceFills", "api", async (_t, client) => {
    const data = await Promise.all([
        deadline(
            new Promise<WsUserTwapSliceFills>((resolve) => {
                client.userTwapSliceFills({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }, resolve);
            }),
            10_000,
        ),
    ]);
    schemaCoverage(WsUserTwapSliceFills, data, {
        ignoreBranches: {
            "#/properties/twapSliceFills/items/properties/fill/properties/twapId": [0],
        },
        ignoreUndefinedTypes: ["#/properties/isSnapshot"],
    });
});
