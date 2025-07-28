import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, type ExchangeClient, type InfoClient, type MultiSignClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/mod.ts";
import { runTest } from "./_t.ts";

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["spotDeploy"]>>;
const _MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");
async function testFn(
    t: Deno.TestContext,
    client: {
        info: InfoClient;
        exchange: ExchangeClient | MultiSignClient;
    },
) {
    await t.step("registerToken2", async () => {
        await assertRejects(
            () =>
                client.exchange.spotDeploy({
                    registerToken2: {
                        spec: {
                            name: "TestToken",
                            szDecimals: 8,
                            weiDecimals: 8,
                        },
                        maxGas: 1000000,
                        fullName: "TestToken (TT)",
                    },
                }),
            ApiRequestError,
        );
    });
    await t.step("userGenesis", async () => {
        await assertRejects(
            () =>
                client.exchange.spotDeploy({
                    userGenesis: {
                        token: 0,
                        userAndWei: [],
                        existingTokenAndWei: [],
                        blacklistUsers: [],
                    },
                }),
            ApiRequestError,
            "Genesis error:",
        );
    });
    await t.step("genesis", async () => {
        await assertRejects(
            () =>
                client.exchange.spotDeploy({
                    genesis: {
                        token: 0,
                        maxSupply: "10000000000",
                        noHyperliquidity: true,
                    },
                }),
            ApiRequestError,
            "Genesis error:",
        );
    });
    await t.step("registerSpot", async () => {
        await assertRejects(
            () =>
                client.exchange.spotDeploy({
                    registerSpot: {
                        tokens: [0, 0],
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        );
    });
    await t.step("registerHyperliquidity", async () => {
        await assertRejects(
            () =>
                client.exchange.spotDeploy({
                    registerHyperliquidity: {
                        spot: 0,
                        startPx: "1",
                        orderSz: "1",
                        nOrders: 1,
                        nSeededLevels: 1,
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        );
    });
    await t.step("setDeployerTradingFeeShare", async () => {
        await assertRejects(
            () =>
                client.exchange.spotDeploy({
                    setDeployerTradingFeeShare: {
                        token: 0,
                        share: "0%",
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        );
    });
}

runTest("spotDeploy", testFn);
