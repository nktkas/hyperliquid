import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { ApiRequestError, HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("spotDeploy", async (t) => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("Register Token", async (t) => {
        await t.step("fullName", async (t) => {
            await t.step("with", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
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
                    "Deploy gas auction error:",
                );
            });

            await t.step("without", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
                            registerToken2: {
                                spec: {
                                    name: "TestToken",
                                    szDecimals: 8,
                                    weiDecimals: 8,
                                },
                                maxGas: 1000000,
                            },
                        }),
                    ApiRequestError,
                    "Deploy gas auction error:",
                );
            });
        });
    });

    await t.step("User Genesis", async (t) => {
        await t.step("blacklistUsers", async (t) => {
            await t.step("with", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
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

            await t.step("without", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
                            userGenesis: {
                                token: 0,
                                userAndWei: [],
                                existingTokenAndWei: [],
                            },
                        }),
                    ApiRequestError,
                    "Genesis error:",
                );
            });
        });
    });

    await t.step("Genesis", async (t) => {
        await t.step("noHyperliquidity", async (t) => {
            await t.step("with", async (t) => {
                await t.step("true", async () => {
                    await assertRejects(
                        () =>
                            walletClient.spotDeploy({
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

                await t.step("false", async () => {
                    await assertRejects(
                        () =>
                            walletClient.spotDeploy({
                                genesis: {
                                    token: 0,
                                    maxSupply: "10000000000",
                                    // @ts-ignore - error testing
                                    noHyperliquidity: false,
                                },
                            }),
                        ApiRequestError,
                        "Cannot process API request:",
                    );
                });
            });

            await t.step("without", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
                            genesis: {
                                token: 0,
                                maxSupply: "10000000000",
                            },
                        }),
                    ApiRequestError,
                    "Genesis error:",
                );
            });
        });
    });

    await t.step("Register Spot", async () => {
        await assertRejects(
            () =>
                walletClient.spotDeploy({
                    registerSpot: {
                        tokens: [0, 0],
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        );
    });

    await t.step("Register Hyperliquidity", async (t) => {
        await t.step("nSeededLevels", async (t) => {
            await t.step("with", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
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

            await t.step("without", async () => {
                await assertRejects(
                    () =>
                        walletClient.spotDeploy({
                            registerHyperliquidity: {
                                spot: 0,
                                startPx: "1",
                                orderSz: "1",
                                nOrders: 1,
                            },
                        }),
                    ApiRequestError,
                    "Error deploying spot:",
                );
            });
        });
    });

    await t.step("Set Deployer Trading Fee Share", async () => {
        await assertRejects(
            () =>
                walletClient.spotDeploy({
                    setDeployerTradingFeeShare: {
                        token: 0,
                        share: "0%",
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        );
    });
});
