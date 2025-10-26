// deno-lint-ignore-file no-import-prefix
import { parser, PerpDeployRequest } from "@nktkas/hyperliquid/api/exchange";
import { ApiRequestError } from "@nktkas/hyperliquid";
import { assertRejects } from "jsr:@std/assert@1";
import { runTest } from "./_t.ts";

runTest({
  name: "perpDeploy",
  codeTestFn: async (t, exchClient) => {
    await t.step("registerAsset", async () => {
      await assertRejects(
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

    await t.step("setOracle", async () => {
      await assertRejects(
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
        "Invalid oracle updater",
      );
    });

    await t.step("setFundingMultipliers", async () => {
      await assertRejects(
        async () => {
          await exchClient.perpDeploy({
            setFundingMultipliers: [["TEST0", "1"]],
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
      );
    });

    await t.step("haltTrading", async () => {
      await assertRejects(
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

    await t.step("setMarginTableIds", async () => {
      await assertRejects(
        async () => {
          await exchClient.perpDeploy({
            setMarginTableIds: [["TEST0", 1]],
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
      );
    });

    await t.step("setFeeRecipient", async () => {
      await assertRejects(
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

    await t.step("setOpenInterestCaps", async () => {
      await assertRejects(
        async () => {
          await exchClient.perpDeploy({
            setOpenInterestCaps: [["TEST0", 1]],
          });
        },
        ApiRequestError,
        "Unknown coin TEST0",
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
