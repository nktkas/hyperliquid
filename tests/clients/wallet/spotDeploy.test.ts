import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { ApiRequestError, HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("spotDeploy", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await Promise.all([
        // Register Token | fullName
        assertRejects( // exists
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
        ),
        assertRejects( // does not exist
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
        ),
        // User Genesis | blacklistUsers
        assertRejects( // exists
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
        ),
        assertRejects( // does not exist
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
        ),
        // Genesis | noHyperliquidity
        assertRejects( // exists
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
        ),
        assertRejects( // does not exist
            () =>
                walletClient.spotDeploy({
                    genesis: {
                        token: 0,
                        maxSupply: "10000000000",
                    },
                }),
            ApiRequestError,
            "Genesis error:",
        ),
        // Register Spot
        assertRejects(
            () =>
                walletClient.spotDeploy({
                    registerSpot: {
                        tokens: [0, 0],
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        ),
        // Register Hyperliquidity | nSeededLevels
        assertRejects( // exists
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
        ),
        assertRejects( // does not exist
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
        ),
        // Set Deployer Trading Fee Share
        assertRejects(
            () =>
                walletClient.spotDeploy({
                    setDeployerTradingFeeShare: {
                        token: 0,
                        share: "0%",
                    },
                }),
            ApiRequestError,
            "Error deploying spot:",
        ),
    ]);
});
