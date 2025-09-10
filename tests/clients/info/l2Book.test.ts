import { Book, L2BookRequest, parser } from "@nktkas/hyperliquid/schemas";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "l2Book",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.l2Book({ coin: "ETH" }),
        ]);
        schemaCoverage(Book, data);
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "l2Book", "--coin", "ETH"]);
        parser(L2BookRequest)(JSON.parse(data));
    },
});
