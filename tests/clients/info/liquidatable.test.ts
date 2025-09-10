import { LiquidatableRequest, parser } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "liquidatable",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.liquidatable(),
        ]);
        schemaCoverage(v.array(v.unknown()), data, {
            ignoreEmptyArray: ["#"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "liquidatable"]);
        parser(LiquidatableRequest)(JSON.parse(data));
    },
});
