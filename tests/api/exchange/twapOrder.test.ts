import * as v from "@valibot/valibot";
import { TwapOrderRequest } from "@nktkas/hyperliquid/api/exchange";
import { formatSize } from "@nktkas/hyperliquid/utils";
import { allMids, runTest, symbolConverter } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/twapOrder.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "TwapOrderSuccessResponse");

runTest({
  name: "twapOrder",
  codeTestFn: async (_t, exchClient) => {
    // ========== Prepare ==========

    const id = symbolConverter.getAssetId("SOL")!;
    const szDecimals = symbolConverter.getSzDecimals("SOL")!;
    const midPx = allMids["SOL"];

    const sz = formatSize(60 / parseFloat(midPx), szDecimals);

    // ========== Test ==========

    const data = await Promise.all([
      exchClient.twapOrder({
        twap: {
          a: id,
          b: true,
          s: sz,
          r: false,
          m: 5,
          t: false,
        },
      }),
    ]);
    schemaCoverage(typeSchema, data);
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "twapOrder",
      `--twap=${
        JSON.stringify({
          a: 0,
          b: true,
          s: 0,
          r: false,
          m: 5,
          t: false,
        })
      }`,
    ]);
    v.parse(TwapOrderRequest, data);
  },
});
