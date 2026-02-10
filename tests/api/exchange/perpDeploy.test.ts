import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { type PerpDeployParameters, PerpDeployRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const paramsSchema = valibotToJsonSchema(
  v.union(
    PerpDeployRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  ),
);

runTest({
  name: "perpDeploy",
  codeTestFn: async (_t, exchClient) => {
    const params: PerpDeployParameters[] = [
      {
        registerAsset2: {
          maxGas: 1000000000000,
          assetRequest: {
            coin: "1",
            szDecimals: 1,
            oraclePx: "1",
            marginTableId: 1,
            marginMode: "noCross",
          },
          dex: "test",
          schema: null,
        },
      },
      {
        registerAsset2: {
          maxGas: null,
          assetRequest: {
            coin: "2",
            szDecimals: 1,
            oraclePx: "1",
            marginTableId: 1,
            marginMode: "strictIsolated",
          },
          dex: "test",
          schema: {
            fullName: "test",
            collateralToken: 0,
            oracleUpdater: null,
          },
        },
      },
      {
        registerAsset2: {
          maxGas: null,
          assetRequest: {
            coin: "3",
            szDecimals: 1,
            oraclePx: "1",
            marginTableId: 1,
            marginMode: "noCross",
          },
          dex: "test",
          schema: {
            fullName: "test",
            collateralToken: 0,
            oracleUpdater: "0x0000000000000000000000000000000000000001",
          },
        },
      },
      {
        registerAsset: {
          maxGas: 1000000000000,
          assetRequest: {
            coin: "1",
            szDecimals: 1,
            oraclePx: "1",
            marginTableId: 1,
            onlyIsolated: true,
          },
          dex: "test",
          schema: null,
        },
      },
      {
        registerAsset: {
          maxGas: null,
          assetRequest: {
            coin: "2",
            szDecimals: 1,
            oraclePx: "1",
            marginTableId: 1,
            onlyIsolated: false,
          },
          dex: "test",
          schema: {
            fullName: "test",
            collateralToken: 0,
            oracleUpdater: "0x0000000000000000000000000000000000000001",
          },
        },
      },
      {
        registerAsset: {
          maxGas: null,
          assetRequest: {
            coin: "3",
            szDecimals: 1,
            oraclePx: "1",
            marginTableId: 1,
            onlyIsolated: false,
          },
          dex: "test",
          schema: {
            fullName: "test",
            collateralToken: 0,
            oracleUpdater: null,
          },
        },
      },
      {
        setOracle: {
          dex: "test",
          oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
          markPxs: [[["TEST0", "3.0"], ["TEST1", "14"]]],
          externalPerpPxs: [["TEST0", "5.0"], ["TEST1", "6"]],
        },
      },
      { setFundingMultipliers: [["TEST0", "1"]] },
      { haltTrading: { coin: "TEST0", isHalted: true } },
      { setMarginTableIds: [["TEST0", 1]] },
      {
        setFeeRecipient: {
          dex: "test",
          feeRecipient: "0x0000000000000000000000000000000000000000",
        },
      },
      { setOpenInterestCaps: [["TEST0", 1]] },
      {
        setSubDeployers: {
          dex: "test",
          subDeployers: [{
            variant: "setOracle",
            user: "0x0000000000000000000000000000000000000000",
            allowed: true,
          }],
        },
      },
      { setMarginModes: [["TEST0", "noCross"], ["TEST1", "strictIsolated"]] },
      { setFeeScale: { dex: "test", scale: "2.5" } },
      { setGrowthModes: [["TEST0", true]] },
    ];

    await Promise.all(params.map((p) =>
      assertRejects(
        async () => {
          await exchClient.perpDeploy(p);
        },
        ApiRequestError,
      )
    ));

    schemaCoverage(paramsSchema, params);
  },
});
