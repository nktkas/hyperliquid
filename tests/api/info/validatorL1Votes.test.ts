import { parser, ValidatorL1VotesRequest, ValidatorL1VotesResponse } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "validatorL1Votes",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.validatorL1Votes(),
    ]);
    schemaCoverage(ValidatorL1VotesResponse, data, {
      ignoreEmptyArray: ["#"],
      ignoreBranches: {
        "#/items/properties/action": [0, 1],
      },
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "validatorL1Votes"]);
    parser(ValidatorL1VotesRequest)(data);
  },
});
