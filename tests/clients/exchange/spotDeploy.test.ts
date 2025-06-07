import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { assertRejects } from "jsr:@std/assert@1";
import { ApiRequestError, ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("spotDeploy", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await Promise.all([
        // Register Token | fullName
        assertRejects( // exists
            () =>
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
                exchClient.spotDeploy({
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
