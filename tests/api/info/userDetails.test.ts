import { parser, UserDetailsRequest, UserDetailsResponse } from "../../../src/api/info/~mod.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "userDetails",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.userDetails({ user: "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83" }),
    ]);
    schemaCoverage(UserDetailsResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "userDetails", "--user", "0x9150749C4cec13Dc7c1555D0d664F08d4d81Be83"]);
    parser(UserDetailsRequest)(JSON.parse(data));
  },
});
