import { ExtraAgent, ExtraAgentsRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "extraAgents",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.extraAgents({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
        ]);
        schemaCoverage(v.array(ExtraAgent), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "extraAgents", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
        parser(ExtraAgentsRequest)(JSON.parse(data));
    },
});
