import assert from "node:assert";
import { parser, PerpDeployRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "perpDeploy",
  codeTestFn: async (t, exchClient) => {
    await t.test("registerAsset", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
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
          });
        },
        ApiRequestError,
        "Invalid perp deployer",
      );
    });

    await t.test("setOracle", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            setOracle: {
              dex: "test",
              oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
              markPxs: [[["TEST0", "3.0"], ["TEST1", "14"]]],
              externalPerpPxs: [["TEST0", "5.0"], ["TEST1", "6"]],
            },
          });
        },
        ApiRequestError,
        "Invalid perp deployer",
      );
    });

    await t.test("setFundingMultipliers", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            setFundingMultipliers: [["TEST0", "1"]],
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
      );
    });

    await t.test("haltTrading", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            haltTrading: {
              coin: "TEST0",
              isHalted: true,
            },
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
      );
    });

    await t.test("setMarginTableIds", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            setMarginTableIds: [["TEST0", 1]],
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
      );
    });

    await t.test("setFeeRecipient", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            setFeeRecipient: {
              dex: "test",
              feeRecipient: "0x0000000000000000000000000000000000000000",
            },
          });
        },
        ApiRequestError,
        "Invalid perp deployer",
      );
    });

    await t.test("setOpenInterestCaps", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            setOpenInterestCaps: [["TEST0", 1]],
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
      );
    });

    await t.test("setOpenInterestCaps", async () => {
      await assert.rejects(
        async () => {
          await exchClient.perpDeploy({
            setSubDeployers: {
              dex: "test",
              subDeployers: [{
                variant: "setOracle",
                user: "0x0000000000000000000000000000000000000000",
                allowed: true,
              }],
            },
          });
        },
        ApiRequestError,
        "Invalid perp deployer",
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "perpDeploy",
      "--registerAsset",
      JSON.stringify({
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
      }),
    ]);
    parser(PerpDeployRequest)(data);
  },
});
