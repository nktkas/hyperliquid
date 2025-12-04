import * as v from "@valibot/valibot";
import { AlignedQuoteTokenInfoRequest, AlignedQuoteTokenInfoResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "alignedQuoteTokenInfo",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.alignedQuoteTokenInfo({ token: 1328 }),
    ]);
    schemaCoverage(AlignedQuoteTokenInfoResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "alignedQuoteTokenInfo",
      "--token=1328",
    ]);
    v.parse(AlignedQuoteTokenInfoRequest, data);
  },
});
