import { parser, TwapHistory, TwapHistoryRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "twapHistory",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.twapHistory({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
        ]);
        schemaCoverage(v.array(TwapHistory), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "twapHistory", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
        parser(TwapHistoryRequest)(JSON.parse(data));
    },
});
