import * as v from "@valibot/valibot";
import { type UpdateIsolatedMarginParameters, UpdateIsolatedMarginRequest } from "@nktkas/hyperliquid/api/exchange";
import { openOrder, runTest, symbolConverter } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/exchange/_methods/updateIsolatedMargin.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "UpdateIsolatedMarginSuccessResponse");
const paramsSchema = valibotToJsonSchema(
  v.omit(v.object(UpdateIsolatedMarginRequest.entries.action.entries), ["type"]),
);

runTest({
  name: "updateIsolatedMargin",
  codeTestFn: async (_t, exchClient) => {
    const id = symbolConverter.getAssetId("SOL")!;
    await exchClient.updateLeverage({ asset: id, isCross: false, leverage: 1 });
    await openOrder(exchClient, "market", "SOL");

    // increase margin
    const increase = await (async () => {
      const params: UpdateIsolatedMarginParameters = { asset: id, isBuy: true, ntli: 2 * 1e6 };
      return { params, result: await exchClient.updateIsolatedMargin(params) };
    })();
    // decrease margin
    const decrease = await (async () => {
      const params: UpdateIsolatedMarginParameters = { asset: id, isBuy: true, ntli: -1 * 1e6 };
      return { params, result: await exchClient.updateIsolatedMargin(params) };
    })();

    const data = [increase, decrease];

    schemaCoverage(paramsSchema, data.map((d) => d.params));
    schemaCoverage(responseSchema, data.map((d) => d.result));
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "updateIsolatedMargin",
      "--asset=0",
      "--isBuy=true",
      "--ntli=1",
    ]);
    v.parse(UpdateIsolatedMarginRequest, data);
  },
});
