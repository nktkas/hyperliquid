import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { ApiRequestError, HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("perpDeploy", async (t) => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await t.step("Register Asset", async (t) => {
        await t.step("maxGas", async (t) => {
            await t.step("with", async () => {
                await assertRejects(
                    () =>
                        walletClient.perpDeploy({
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
                            },
                        }),
                    ApiRequestError,
                    "Error deploying perp:",
                );
            });

            await t.step("without", async () => {
                await assertRejects(
                    () =>
                        walletClient.perpDeploy({
                            registerAsset: {
                                assetRequest: {
                                    coin: "1",
                                    szDecimals: 1,
                                    oraclePx: "1",
                                    marginTableId: 1,
                                    onlyIsolated: true,
                                },
                                dex: "test",
                            },
                        }),
                    ApiRequestError,
                    "Error deploying perp:",
                );
            });
        });

        await t.step("schema", async (t) => {
            await t.step("with", async (t) => {
                await t.step("schema.oracleUpdater", async (t) => {
                    await t.step("with", async () => {
                        await assertRejects(
                            () =>
                                walletClient.perpDeploy({
                                    registerAsset: {
                                        assetRequest: {
                                            coin: "1",
                                            szDecimals: 1,
                                            oraclePx: "1",
                                            marginTableId: 1,
                                            onlyIsolated: true,
                                        },
                                        dex: "test",
                                        schema: {
                                            fullName: "test dex",
                                            collateralToken: 0,
                                            oracleUpdater: "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1",
                                        },
                                    },
                                }),
                            ApiRequestError,
                            "Error deploying perp:",
                        );
                    });

                    await t.step("without", async () => {
                        await assertRejects(
                            () =>
                                walletClient.perpDeploy({
                                    registerAsset: {
                                        assetRequest: {
                                            coin: "1",
                                            szDecimals: 1,
                                            oraclePx: "1",
                                            marginTableId: 1,
                                            onlyIsolated: true,
                                        },
                                        dex: "test",
                                        schema: {
                                            fullName: "test dex",
                                            collateralToken: 0,
                                        },
                                    },
                                }),
                            ApiRequestError,
                            "Error deploying perp:",
                        );
                    });
                });
            });

            await t.step("without", async () => {
                await assertRejects(
                    () =>
                        walletClient.perpDeploy({
                            registerAsset: {
                                assetRequest: {
                                    coin: "1",
                                    szDecimals: 1,
                                    oraclePx: "1",
                                    marginTableId: 1,
                                    onlyIsolated: true,
                                },
                                dex: "test",
                            },
                        }),
                    ApiRequestError,
                    "Error deploying perp:",
                );
            });
        });
    });

    await t.step("Set Oracle", async () => {
        await assertRejects(
            () =>
                walletClient.perpDeploy({
                    setOracle: {
                        dex: "test",
                        oraclePxs: [["TEST0", "12.0"], ["TEST1", "1"]],
                        markPxs: [["TEST0", "3.0"], ["TEST1", "14"]],
                    },
                }),
            ApiRequestError,
            "Error deploying perp:",
        );
    });
});
