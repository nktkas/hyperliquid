import { Fill, parser, UserFillsByTimeRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "userFillsByTime",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.userFillsByTime({
                user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
        ]);
        schemaCoverage(v.array(Fill), data, {
            ignoreBranches: {
                "#/items/properties/twapId": [0],
            },
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand([
            "info",
            "userFillsByTime",
            "--user",
            "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
            "--startTime",
            "1725991229384",
        ]);
        parser(UserFillsByTimeRequest)(JSON.parse(data));
    },
});
