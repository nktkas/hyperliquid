import * as v from "@valibot/valibot";
import { MaxBuilderFeeRequest, MaxBuilderFeeResponse } from "@nktkas/hyperliquid/api/info";
import { runTest } from "./_t.ts";
import { schemaCoverage } from "../_schemaCoverage.ts";

runTest({
  name: "maxBuilderFee",
  codeTestFn: async (_t, client) => {
    const data = await Promise.all([
      client.maxBuilderFee({
        user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      }),
    ]);
    schemaCoverage(MaxBuilderFeeResponse, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "info",
      "maxBuilderFee",
      "--user=0xe019d6167E7e324aEd003d94098496b6d986aB05",
      "--builder=0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    v.parse(MaxBuilderFeeRequest, data);
  },
});
