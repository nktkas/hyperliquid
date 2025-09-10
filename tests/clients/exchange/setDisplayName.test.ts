import { parser, SetDisplayNameRequest, SuccessResponse } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "setDisplayName",
    codeTestFn: async (_t, clients) => {
        const data = await Promise.all([
            clients.exchange.setDisplayName({ displayName: "" }),
        ]);
        schemaCoverage(SuccessResponse, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["exchange", "setDisplayName", "--displayName", "test"]);
        parser(SetDisplayNameRequest)(JSON.parse(data));
    },
});
