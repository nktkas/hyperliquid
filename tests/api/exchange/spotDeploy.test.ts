// deno-lint-ignore-file no-import-prefix
import * as v from "@valibot/valibot";
import { assertRejects } from "jsr:@std/assert@1";
import { SpotDeployRequest } from "@nktkas/hyperliquid/api/exchange";
import { runTest } from "./_t.ts";
import { ApiRequestError } from "@nktkas/hyperliquid";

runTest({
  name: "spotDeploy",
  codeTestFn: async (t, exchClient) => {
    await t.step("registerToken2", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            registerToken2: {
              spec: {
                name: "TestToken",
                szDecimals: 8,
                weiDecimals: 8,
              },
              maxGas: 1000000,
              fullName: "TestToken (TT)",
            },
          });
        },
        ApiRequestError,
      );
    });

    await t.step("userGenesis", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            userGenesis: {
              token: 0,
              userAndWei: [],
              existingTokenAndWei: [],
              blacklistUsers: [],
            },
          });
        },
        ApiRequestError,
        "Error deploying spot",
      );
    });

    await t.step("genesis", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            genesis: {
              token: 0,
              maxSupply: "10000000000",
              noHyperliquidity: true,
            },
          });
        },
        ApiRequestError,
        "Error deploying spot",
      );
    });

    await t.step("registerSpot", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            registerSpot: {
              tokens: [0, 0],
            },
          });
        },
        ApiRequestError,
        "Error deploying spot:",
      );
    });

    await t.step("registerHyperliquidity", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            registerHyperliquidity: {
              spot: 0,
              startPx: "1",
              orderSz: "1",
              nOrders: 1,
              nSeededLevels: 1,
            },
          });
        },
        ApiRequestError,
        "Error deploying spot:",
      );
    });

    await t.step("setDeployerTradingFeeShare", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            setDeployerTradingFeeShare: {
              token: 0,
              share: "0%",
            },
          });
        },
        ApiRequestError,
        "Error deploying spot:",
      );
    });

    await t.step("enableQuoteToken", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            enableQuoteToken: {
              token: 0,
            },
          });
        },
        ApiRequestError,
        "Error deploying spot:",
      );
    });

    await t.step("enableAlignedQuoteToken", async () => {
      await assertRejects(
        async () => {
          await exchClient.spotDeploy({
            enableAlignedQuoteToken: {
              token: 0,
            },
          });
        },
        ApiRequestError,
        "Error deploying spot:",
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "spotDeploy",
      `--registerToken2=${
        JSON.stringify({
          spec: {
            name: "TestToken",
            szDecimals: 8,
            weiDecimals: 8,
          },
          maxGas: 1000000,
          fullName: "TestToken (TT)",
        })
      }`,
    ]);
    v.parse(SpotDeployRequest, data);
  },
});
