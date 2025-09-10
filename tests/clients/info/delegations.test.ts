import { Delegation, DelegationsRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "delegations",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.delegations({ user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" }),
        ]);
        schemaCoverage(v.array(Delegation), data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "delegations", "--user", "0x563C175E6f11582f65D6d9E360A618699DEe14a9"]);
        parser(DelegationsRequest)(JSON.parse(data));
    },
});
