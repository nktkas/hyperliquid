import assert from "node:assert";
import { parser, SpotDeployRequest } from "../../../src/api/exchange/~mod.ts";
import { ApiRequestError } from "../../../src/mod.ts";
import { runTest } from "./_t.ts";

runTest({
  name: "spotDeploy",
  codeTestFn: async (t, exchClient) => {
    await t.test("registerToken2", async () => {
      await assert.rejects(
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
        (e) => e instanceof ApiRequestError,
      );
    });

    await t.test("userGenesis", async () => {
      await assert.rejects(
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
        (e) => e instanceof ApiRequestError && e.message.includes("Genesis error:"),
      );
    });

    await t.test("genesis", async () => {
      await assert.rejects(
        async () => {
          await exchClient.spotDeploy({
            genesis: {
              token: 0,
              maxSupply: "10000000000",
              noHyperliquidity: true,
            },
          });
        },
        (e) => e instanceof ApiRequestError && e.message.includes("Genesis error:"),
      );
    });

    await t.test("registerSpot", async () => {
      await assert.rejects(
        async () => {
          await exchClient.spotDeploy({
            registerSpot: {
              tokens: [0, 0],
            },
          });
        },
        (e) => e instanceof ApiRequestError && e.message.includes("Error deploying spot:"),
      );
    });

    await t.test("registerHyperliquidity", async () => {
      await assert.rejects(
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
        (e) => e instanceof ApiRequestError && e.message.includes("Error deploying spot:"),
      );
    });

    await t.test("setDeployerTradingFeeShare", async () => {
      await assert.rejects(
        async () => {
          await exchClient.spotDeploy({
            setDeployerTradingFeeShare: {
              token: 0,
              share: "0%",
            },
          });
        },
        (e) => e instanceof ApiRequestError && e.message.includes("Error deploying spot:"),
      );
    });

    await t.test("enableQuoteToken", async () => {
      await assert.rejects(
        async () => {
          await exchClient.spotDeploy({
            enableQuoteToken: {
              token: 0,
            },
          });
        },
        (e) => e instanceof ApiRequestError && e.message.includes("Error deploying spot:"),
      );
    });
  },
  cliTestFn: async (_t, runCommand) => {
    const data = await runCommand([
      "exchange",
      "spotDeploy",
      "--registerToken2",
      JSON.stringify({
        spec: {
          name: "TestToken",
          szDecimals: 8,
          weiDecimals: 8,
        },
        maxGas: 1000000,
        fullName: "TestToken (TT)",
      }),
    ]);
    parser(SpotDeployRequest)(data);
  },
});
