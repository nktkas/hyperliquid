import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type SpotDeployParameters, SpotDeployRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(
  v.union(
    SpotDeployRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  ),
);

runTest({
  name: "spotDeploy",
  codeTestFn: async (_t, exchClient) => {
    const params: SpotDeployParameters[] = [
      {
        registerToken2: {
          spec: {
            name: "TestToken",
            szDecimals: 8,
            weiDecimals: 8,
          },
          maxGas: 1000000,
          fullName: "TestToken (TT)",
        },
      },
      {
        registerToken2: {
          spec: {
            name: "TestToken2",
            szDecimals: 8,
            weiDecimals: 8,
          },
          maxGas: 1000000,
        },
      },
      {
        userGenesis: {
          token: 0,
          userAndWei: [["0x0000000000000000000000000000000000000001", "1"]],
          existingTokenAndWei: [[0, "1"]],
          blacklistUsers: [["0x0000000000000000000000000000000000000001", true]],
        },
      },
      {
        userGenesis: {
          token: 0,
          userAndWei: [],
          existingTokenAndWei: [],
        },
      },
      {
        genesis: {
          token: 0,
          maxSupply: "10000000000",
          noHyperliquidity: true,
        },
      },
      {
        genesis: {
          token: 0,
          maxSupply: "10000000000",
        },
      },
      {
        registerSpot: {
          tokens: [0, 0],
        },
      },
      {
        registerHyperliquidity: {
          spot: 0,
          startPx: "1",
          orderSz: "1",
          nOrders: 1,
          nSeededLevels: 1,
        },
      },
      {
        registerHyperliquidity: {
          spot: 0,
          startPx: "1",
          orderSz: "1",
          nOrders: 1,
        },
      },
      {
        setDeployerTradingFeeShare: {
          token: 0,
          share: "0%",
        },
      },
      {
        enableQuoteToken: {
          token: 0,
        },
      },
      {
        enableAlignedQuoteToken: {
          token: 0,
        },
      },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.spotDeploy(p);
        },
        ApiRequestError,
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
