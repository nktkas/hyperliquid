import { IsVipRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "isVip",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.isVip({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
        ]);
        schemaCoverage(v.nullable(v.boolean()), data, {
            ignoreNullTypes: ["#"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "isVip", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
        parser(IsVipRequest)(JSON.parse(data));
    },
});
