import { MaxBuilderFeeRequest, MaxBuilderFeeResponse, parser } from "@nktkas/hyperliquid/api/info";
import { schemaCoverage } from "../_schemaCoverage.ts";
import { runTest } from "./_t.ts";

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
      "--user",
      "0xe019d6167E7e324aEd003d94098496b6d986aB05",
      "--builder",
      "0xe019d6167E7e324aEd003d94098496b6d986aB05",
    ]);
    parser(MaxBuilderFeeRequest)(JSON.parse(data));
  },
});
