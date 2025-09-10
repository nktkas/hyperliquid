import { parser, ValidatorL1Vote, ValidatorL1VotesRequest } from "@nktkas/hyperliquid/schemas";
import * as v from "valibot";
import { schemaCoverage } from "../../_utils/schema_coverage.ts";
import { runTest } from "./_t.ts";

runTest({
    name: "validatorL1Votes",
    codeTestFn: async (_t, client) => {
        const data = await Promise.all([
            client.validatorL1Votes(),
        ]);
        schemaCoverage(v.array(ValidatorL1Vote), data, {
            ignoreEmptyArray: ["#"],
        });
    },
    cliTestFn: async (_t, runCommand) => {
        const data = await runCommand(["info", "validatorL1Votes"]);
        parser(ValidatorL1VotesRequest)(JSON.parse(data));
    },
});
