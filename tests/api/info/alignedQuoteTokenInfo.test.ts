import { AlignedQuoteTokenInfoRequest, AlignedQuoteTokenInfoResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "alignedQuoteTokenInfo",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.alignedQuoteTokenInfo({ token: 1328 }),
    ]);
    schemaCoverage(AlignedQuoteTokenInfoResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand(["info", "alignedQuoteTokenInfo", "--token", "1328"]);
    parser(AlignedQuoteTokenInfoRequest)(JSON.parse(data));
  },
});
