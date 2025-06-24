import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import type { SchemaObject } from "npm:ajv@8";
import { HttpTransport, InfoClient } from "../../mod.ts";
import { schemaGenerator } from "../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const cliArgs = parseArgs(Deno.args, { default: { wait: 3000 } }) as Args<{
    /** Delay to avoid rate limits */
    wait?: number;
}>;

const METHODS_TO_TEST = [ // controls which tests to run
    "allMids",
    "blockDetails",
    "candleSnapshot",
    "clearinghouseState",
    "delegations",
    "delegatorHistory",
    "delegatorRewards",
    "delegatorSummary",
    "exchangeStatus",
    "extraAgents",
    "frontendOpenOrders",
    "fundingHistory",
    "historicalOrders",
    "isVip",
    "l2Book",
    "leadingVaults",
    "legalCheck",
    "liquidatable",
    "marginTable",
    "maxBuilderFee",
    "maxMarketOrderNtls",
    "meta",
    "metaAndAssetCtxs",
    "openOrders",
    "orderStatus",
    "perpDeployAuctionStatus",
    "perpDexs",
    "perpsAtOpenInterestCap",
    "portfolio",
    "predictedFundings",
    "preTransferCheck",
    "referral",
    "spotClearinghouseState",
    "spotDeployState",
    "spotMeta",
    "spotMetaAndAssetCtxs",
    "subAccounts",
    "tokenDetails",
    "twapHistory",
    "txDetails",
    "userDetails",
    "userFees",
    "userFills",
    "userFillsByTime",
    "userFunding",
    "userNonFundingLedgerUpdates",
    "userRateLimit",
    "userRole",
    "userToMultiSigSigners",
    "userTwapSliceFills",
    "userTwapSliceFillsByTime",
    "userVaultEquities",
    "validatorL1Votes",
    "validatorSummaries",
    "vaultDetails",
    "vaultSummaries",
];

// —————————— Tests ——————————

const transport = new HttpTransport({ isTestnet: true });
const infoClient = new InfoClient({ transport });

function run<T extends Record<string, unknown>>(
    name: string,
    fn: (types: SchemaObject, args: T) => Promise<void>,
    args: T = {} as T,
) {
    const MethodReturnType = schemaGenerator(import.meta.url, `MethodReturnType_${name}`);
    Deno.test(name, { ignore: !METHODS_TO_TEST.includes(name) }, async () => {
        await new Promise((r) => setTimeout(r, cliArgs.wait)); // delay to avoid rate limits
        await fn(MethodReturnType, args);
    });
}

export type MethodReturnType_allMids = Awaited<ReturnType<InfoClient["allMids"]>>;
run(
    "allMids",
    async (types) => {
        const data = await Promise.all([
            infoClient.allMids(),
            infoClient.allMids({ dex: "test" }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_blockDetails = Awaited<ReturnType<InfoClient["blockDetails"]>>;
run(
    "blockDetails",
    async (types, { height }) => {
        const data = await infoClient.blockDetails({ height });
        schemaCoverage(types, [data]);
    },
    { height: 300836507 },
);

export type MethodReturnType_candleSnapshot = Awaited<ReturnType<InfoClient["candleSnapshot"]>>;
run(
    "candleSnapshot",
    async (types) => {
        const data = await Promise.all([
            // General
            infoClient.candleSnapshot({
                coin: "BTC",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
            }),
            // Check argument 'endTime'
            infoClient.candleSnapshot({
                coin: "BTC",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
                endTime: Date.now(),
            }),
            infoClient.candleSnapshot({
                coin: "BTC",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
                endTime: null,
            }),
            infoClient.candleSnapshot({
                coin: "BTC",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
                endTime: undefined,
            }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_clearinghouseState = Awaited<ReturnType<InfoClient["clearinghouseState"]>>;
run(
    "clearinghouseState",
    async (types, { user }) => {
        const data = await infoClient.clearinghouseState({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_delegations = Awaited<ReturnType<InfoClient["delegations"]>>;
run(
    "delegations",
    async (types, { user }) => {
        const data = await infoClient.delegations({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_delegatorHistory = Awaited<ReturnType<InfoClient["delegatorHistory"]>>;
run(
    "delegatorHistory",
    async (types, { user }) => {
        const data = await infoClient.delegatorHistory({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0xedc88158266c50628a9ffbaa1db2635376577eea" } as const,
);

export type MethodReturnType_delegatorRewards = Awaited<ReturnType<InfoClient["delegatorRewards"]>>;
run(
    "delegatorRewards",
    async (types, { address }) => {
        const data = await Promise.all([
            infoClient.delegatorRewards({ user: address.delegation }),
            infoClient.delegatorRewards({ user: address.commission }),
        ]);
        schemaCoverage(types, data);
    },
    {
        address: {
            delegation: "0xedc88158266c50628a9ffbaa1db2635376577eea",
            commission: "0x3c83a5cae32a05e88ca6a0350edb540194851a76",
        },
    } as const,
);

export type MethodReturnType_delegatorSummary = Awaited<ReturnType<InfoClient["delegatorSummary"]>>;
run(
    "delegatorSummary",
    async (types, { user }) => {
        const data = await infoClient.delegatorSummary({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_exchangeStatus = Awaited<ReturnType<InfoClient["exchangeStatus"]>>;
run(
    "exchangeStatus",
    async (types) => {
        const data = await infoClient.exchangeStatus();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_extraAgents = Awaited<ReturnType<InfoClient["extraAgents"]>>;
run(
    "extraAgents",
    async (types, { user }) => {
        const data = await infoClient.extraAgents({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_frontendOpenOrders = Awaited<ReturnType<InfoClient["frontendOpenOrders"]>>;
run(
    "frontendOpenOrders",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.frontendOpenOrders({ user }),
            infoClient.frontendOpenOrders({ user, dex: "test" }),
        ]);
        schemaCoverage(types, data, {
            ignoreEnumValuesByPath: {
                "#/items/properties/orderType": ["Market"],
                "#/items/properties/tif/anyOf/0": ["Ioc", "FrontendMarket", "LiquidationMarket"],
            },
        });
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_fundingHistory = Awaited<ReturnType<InfoClient["fundingHistory"]>>;
run(
    "fundingHistory",
    async (types) => {
        const data = await Promise.all([
            infoClient.fundingHistory({
                coin: "BTC",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
            // Check argument 'endTime'
            infoClient.fundingHistory({
                coin: "BTC",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            }),
            infoClient.fundingHistory({
                coin: "BTC",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: null,
            }),
            infoClient.fundingHistory({
                coin: "BTC",
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: undefined,
            }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_historicalOrders = Awaited<ReturnType<InfoClient["historicalOrders"]>>;
run(
    "historicalOrders",
    async (types, { user }) => {
        const data = await infoClient.historicalOrders({ user });
        schemaCoverage(types, [data], {
            ignoreEnumValuesByPath: {
                "#/items/properties/status": [
                    "delistedCanceled",
                    "liquidatedCanceled",
                    "marginCanceled",
                    "openInterestCapCanceled",
                    "scheduledCancel",
                    "selfTradeCanceled",
                    "siblingFilledCanceled",
                    "vaultWithdrawalCanceled",
                    "reduceOnlyRejected",
                ],
            },
        });
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_isVip = Awaited<ReturnType<InfoClient["isVip"]>>;
run(
    "isVip",
    async (types, { user }) => {
        const data = await infoClient.isVip({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_l2Book = Awaited<ReturnType<InfoClient["l2Book"]>>;
run(
    "l2Book",
    async (types) => {
        const data = await Promise.all([
            infoClient.l2Book({ coin: "BTC" }),
            // Check argument 'nSigFigs'
            infoClient.l2Book({ coin: "BTC", nSigFigs: 2 }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: 3 }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: 4 }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: 5 }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: null }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: undefined }),
            // Check argument 'mantissa'
            infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: 2 }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: 5 }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: null }),
            infoClient.l2Book({ coin: "BTC", nSigFigs: 5, mantissa: undefined }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_leadingVaults = Awaited<ReturnType<InfoClient["leadingVaults"]>>;
run(
    "leadingVaults",
    async (types, { user }) => {
        const data = await infoClient.leadingVaults({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" } as const,
);

export type MethodReturnType_legalCheck = Awaited<ReturnType<InfoClient["legalCheck"]>>;
run(
    "legalCheck",
    async (types, { user }) => {
        const data = await infoClient.legalCheck({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_liquidatable = Awaited<ReturnType<InfoClient["liquidatable"]>>;
run(
    "liquidatable",
    async (types) => {
        const data = await infoClient.liquidatable();
        schemaCoverage(types, [data], { ignoreEmptyArrayPaths: ["#"] });
    },
);

export type MethodReturnType_marginTable = Awaited<ReturnType<InfoClient["marginTable"]>>;
run(
    "marginTable",
    async (types) => {
        const data = await infoClient.marginTable({ id: 1 });
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_maxBuilderFee = Awaited<ReturnType<InfoClient["maxBuilderFee"]>>;
run(
    "maxBuilderFee",
    async (types, { user, builder }) => {
        const data = await infoClient.maxBuilderFee({ user, builder });
        schemaCoverage(types, [data]);
    },
    {
        user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
        builder: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
    } as const,
);

export type MethodReturnType_maxMarketOrderNtls = Awaited<ReturnType<InfoClient["maxMarketOrderNtls"]>>;
run(
    "maxMarketOrderNtls",
    async (types) => {
        const data = await infoClient.maxMarketOrderNtls();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_meta = Awaited<ReturnType<InfoClient["meta"]>>;
run(
    "meta",
    async (types) => {
        const data = await Promise.all([
            infoClient.meta(),
            infoClient.meta({ dex: "test" }),
        ]);
        schemaCoverage(types, data);
    },
);

export type MethodReturnType_metaAndAssetCtxs = Awaited<ReturnType<InfoClient["metaAndAssetCtxs"]>>;
run(
    "metaAndAssetCtxs",
    async (types) => {
        const data = await infoClient.metaAndAssetCtxs();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_openOrders = Awaited<ReturnType<InfoClient["openOrders"]>>;
run(
    "openOrders",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.openOrders({ user }),
            infoClient.openOrders({ user, dex: "test" }),
        ]);
        schemaCoverage(types, data);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_orderStatus = Awaited<ReturnType<InfoClient["orderStatus"]>>;
run(
    "orderStatus",
    async (types, { user, oid }) => {
        const data = await Promise.all([
            infoClient.orderStatus({ user, oid: 0 }),
            infoClient.orderStatus({ user, oid: oid.sideA }),
            infoClient.orderStatus({ user, oid: oid.sideB }),
            infoClient.orderStatus({ user, oid: oid.orderTypeLimit }),
            infoClient.orderStatus({ user, oid: oid.orderTypeStopMarket }),
            infoClient.orderStatus({ user, oid: oid.orderTypeStopLimit }),
            infoClient.orderStatus({ user, oid: oid.orderTypeTakeProfitMarket }),
            infoClient.orderStatus({ user, oid: oid.orderTypeTakeProfitLimit }),

            infoClient.orderStatus({ user, oid: oid.tifNull }),
            infoClient.orderStatus({ user, oid: oid.tifGtc }),
            infoClient.orderStatus({ user, oid: oid.tifAlo }),
            infoClient.orderStatus({ user, oid: oid.tifIoc }),
            infoClient.orderStatus({ user, oid: oid.tifFrontendMarket }),
            infoClient.orderStatus({ user, oid: oid.tifLiquidationMarket }),

            infoClient.orderStatus({ user, oid: oid.statusOpen }),
            infoClient.orderStatus({ user, oid: oid.statusFilled }),
            infoClient.orderStatus({ user, oid: oid.statusCanceled }),
            infoClient.orderStatus({ user, oid: oid.statusRejected }),
            infoClient.orderStatus({ user, oid: oid.statusReduceOnlyCanceled }),

            infoClient.orderStatus({ user, oid: oid.withCloid }),
            infoClient.orderStatus({ user, oid: oid.withoutCloid }),
        ]);
        schemaCoverage(types, data, {
            ignoreEmptyArrayPaths: [
                "#/anyOf/0/properties/order/properties/order/properties/children",
            ],
            ignoreEnumValuesByPath: {
                "#/anyOf/0/properties/order/properties/status": [
                    "delistedCanceled",
                    "liquidatedCanceled",
                    "marginCanceled",
                    "openInterestCapCanceled",
                    "scheduledCancel",
                    "selfTradeCanceled",
                    "siblingFilledCanceled",
                    "triggered",
                    "vaultWithdrawalCanceled",
                    "reduceOnlyRejected",
                ],
            },
        });
    },
    {
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        oid: {
            sideA: 27379010444,
            sideB: 15029784876,
            orderTypeLimit: 15029784876,
            orderTypeStopMarket: 15030144135,
            orderTypeStopLimit: 14940693141,
            orderTypeTakeProfitMarket: 27379010444,
            orderTypeTakeProfitLimit: 27379156434,
            tifNull: 15030144135,
            tifGtc: 15029784876,
            tifAlo: 14947967914,
            tifIoc: 23629760457,
            tifFrontendMarket: 20776394366,
            tifLiquidationMarket: 21904297440,
            statusOpen: 27379010444,
            statusFilled: 15029784876,
            statusCanceled: 15030144135,
            statusRejected: 20776394366,
            statusReduceOnlyCanceled: 27378915177,
            withCloid: "0xd4bb069b673a48161bca56cfc88deb6b",
            withoutCloid: 15548036277,
        },
    } as const,
);

export type MethodReturnType_perpDeployAuctionStatus = Awaited<ReturnType<InfoClient["perpDeployAuctionStatus"]>>;
run(
    "perpDeployAuctionStatus",
    async (types) => {
        const data = await infoClient.perpDeployAuctionStatus();
        schemaCoverage(types, [data], {
            ignoreTypesByPath: {
                "#/properties/currentGas": ["string", "null"],
                "#/properties/endGas": ["string", "null"],
            },
        });
    },
);

export type MethodReturnType_perpDexs = Awaited<ReturnType<InfoClient["perpDexs"]>>;
run(
    "perpDexs",
    async (types) => {
        const data = await infoClient.perpDexs();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_perpsAtOpenInterestCap = Awaited<ReturnType<InfoClient["perpsAtOpenInterestCap"]>>;
run(
    "perpsAtOpenInterestCap",
    async (types) => {
        const data = await infoClient.perpsAtOpenInterestCap();
        schemaCoverage(types, [data], {
            ignoreEmptyArrayPaths: ["#"],
        });
    },
);

export type MethodReturnType_portfolio = Awaited<ReturnType<InfoClient["portfolio"]>>;
run(
    "portfolio",
    async (types, { user }) => {
        const data = await infoClient.portfolio({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_predictedFundings = Awaited<ReturnType<InfoClient["predictedFundings"]>>;
run(
    "predictedFundings",
    async (types) => {
        const data = await infoClient.predictedFundings();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_preTransferCheck = Awaited<ReturnType<InfoClient["preTransferCheck"]>>;
run(
    "preTransferCheck",
    async (types, { user, source }) => {
        const data = await infoClient.preTransferCheck({ user, source });
        schemaCoverage(types, [data]);
    },
    {
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        source: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
    } as const,
);

export type MethodReturnType_referral = Awaited<ReturnType<InfoClient["referral"]>>;
run(
    "referral",
    async (types, { address }) => {
        const mainnetClient = new InfoClient({ transport: new HttpTransport() });

        const data = await Promise.all([
            infoClient.referral({ user: address.nonReferred }),
            infoClient.referral({ user: address.referred }),
            infoClient.referral({ user: address.stateReady }),
            infoClient.referral({ user: address.stateNeedToCreateCode }),
            infoClient.referral({ user: address.stateNeedToTrade }),
            mainnetClient.referral({ user: address.rewardHistory }),
        ]);
        schemaCoverage(types, data);
    },
    {
        address: {
            nonReferred: "0x0000000000000000000000000000000000000001",
            referred: "0x091288cd1e81e065d1541ec73dd0dfdde2f529fa",
            stateReady: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
            stateNeedToCreateCode: "0x97c36726668f490fa17eb2957a92D39116f171fE",
            stateNeedToTrade: "0x0000000000000000000000000000000000000001",
            rewardHistory: "0x745d208c08be6743481cdaf5984956be87ec5a3f", // Mainnet
        },
    } as const,
);

export type MethodReturnType_spotClearinghouseState = Awaited<ReturnType<InfoClient["spotClearinghouseState"]>>;
run(
    "spotClearinghouseState",
    async (types, { user, withEvmEscrows }) => {
        const data = await Promise.all([
            infoClient.spotClearinghouseState({ user }),
            infoClient.spotClearinghouseState({ user, dex: "test" }),
            infoClient.spotClearinghouseState({ user: withEvmEscrows }),
        ]);
        schemaCoverage(types, data);
    },
    {
        user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        withEvmEscrows: "0x1defed46db35334232b9f5fd2e5c6180276fb99d",
    } as const,
);

export type MethodReturnType_spotDeployState = Awaited<ReturnType<InfoClient["spotDeployState"]>>;
run(
    "spotDeployState",
    async (types, { address }) => {
        const data = await Promise.all([
            infoClient.spotDeployState({ user: address.statesFullNameString }),
            infoClient.spotDeployState({ user: address.statesFullNameNull }),
            infoClient.spotDeployState({ user: address.statesMaxSupplyString }),
            infoClient.spotDeployState({ user: address.statesMaxSupplyNull }),
        ]);
        schemaCoverage(types, data, {
            ignoreEmptyArrayPaths: [
                "#/properties/states/items/properties/blacklistUsers",
            ],
            ignoreTypesByPath: {
                "#/properties/gasAuction/properties/currentGas": ["string", "null"],
                "#/properties/gasAuction/properties/endGas": ["string", "null"],
            },
        });
    },
    {
        address: {
            statesFullNameString: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db",
            statesFullNameNull: "0xd8cb8d9747f50be8e423c698f9104ee090540961",
            statesMaxSupplyString: "0x051dbfc562d44e4a01ebb986da35a47ab4f346db",
            statesMaxSupplyNull: "0xd8cb8d9747f50be8e423c698f9104ee090540961",
        },
    } as const,
);

export type MethodReturnType_spotMeta = Awaited<ReturnType<InfoClient["spotMeta"]>>;
run(
    "spotMeta",
    async (types) => {
        const data = await infoClient.spotMeta();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_spotMetaAndAssetCtxs = Awaited<ReturnType<InfoClient["spotMetaAndAssetCtxs"]>>;
run(
    "spotMetaAndAssetCtxs",
    async (types) => {
        const data = await infoClient.spotMetaAndAssetCtxs();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_subAccounts = Awaited<ReturnType<InfoClient["subAccounts"]>>;
run(
    "subAccounts",
    async (types, { address }) => {
        const data = await Promise.all([
            infoClient.subAccounts({ user: address.withoutSubAccounts }),
            infoClient.subAccounts({ user: address.withSubAccounts }),
        ]);
        schemaCoverage(types, data, {
            ignoreBranchesByPath: {
                "#/anyOf/0/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/leverage/anyOf":
                    [0],
            },
            ignoreTypesByPath: {
                "#/anyOf/0/items/properties/clearinghouseState/properties/assetPositions/items/properties/position/properties/liquidationPx":
                    ["string"],
            },
            ignorePropertiesByPath: [
                "#/anyOf/0/items/properties/spotState/properties/evmEscrows",
            ],
        });
    },
    {
        address: {
            withSubAccounts: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
            withoutSubAccounts: "0x0000000000000000000000000000000000000001",
        },
    } as const,
);

export type MethodReturnType_tokenDetails = Awaited<ReturnType<InfoClient["tokenDetails"]>>;
run(
    "tokenDetails",
    async (types, { tokenId }) => {
        const data = await Promise.all([
            infoClient.tokenDetails({ tokenId: tokenId.withGenisis }),
            infoClient.tokenDetails({ tokenId: tokenId.withoutGenisis }),
            infoClient.tokenDetails({ tokenId: tokenId.withDeployer }),
            infoClient.tokenDetails({ tokenId: tokenId.withoutDeployer }),
            infoClient.tokenDetails({ tokenId: tokenId.withDeployGas }),
            infoClient.tokenDetails({ tokenId: tokenId.withoutDeployGas }),
            infoClient.tokenDetails({ tokenId: tokenId.withDeployTime }),
            infoClient.tokenDetails({ tokenId: tokenId.withoutDeployTime }),
        ]);
        schemaCoverage(types, data, {
            ignoreEmptyArrayPaths: [
                "#/properties/genesis/anyOf/0/properties/blacklistUsers",
            ],
        });
    },
    {
        tokenId: {
            withGenisis: "0x3d8a82efa63e86d54a1922c2afdac61e",
            withoutGenisis: "0xc4bf3f870c0e9465323c0b6ed28096c2",

            withDeployer: "0x3d8a82efa63e86d54a1922c2afdac61e",
            withoutDeployer: "0xc4bf3f870c0e9465323c0b6ed28096c2",

            withDeployGas: "0x3d8a82efa63e86d54a1922c2afdac61e",
            withoutDeployGas: "0xeb62eee3685fc4c43992febcd9e75443",

            withDeployTime: "0x3d8a82efa63e86d54a1922c2afdac61e",
            withoutDeployTime: "0xc4bf3f870c0e9465323c0b6ed28096c2",
        },
    } as const,
);

export type MethodReturnType_twapHistory = Awaited<ReturnType<InfoClient["twapHistory"]>>;
run(
    "twapHistory",
    async (types, { user }) => {
        const data = await infoClient.twapHistory({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_txDetails = Awaited<ReturnType<InfoClient["txDetails"]>>;
run(
    "txDetails",
    async (types, { hash }) => {
        const data = await Promise.all([
            infoClient.txDetails({ hash: hash.withError }),
            infoClient.txDetails({ hash: hash.withoutError }),
        ]);
        schemaCoverage(types, data);
    },
    {
        hash: {
            withError: "0x8f1b2b67eda04ecbc7b00411ee669b010c0041e8f52c9ff5c3609d9ef7e66c71",
            withoutError: "0x4de9f1f5d912c23d8fbb0411f01bfe0000eb9f3ccb3fec747cb96e75e8944b06",
        },
    } as const,
);

export type MethodReturnType_userDetails = Awaited<ReturnType<InfoClient["userDetails"]>>;
run(
    "userDetails",
    async (types, { user }) => {
        const data = await infoClient.userDetails({ user });
        schemaCoverage(types, [data], {
            ignoreTypesByPath: {
                "#/properties/txs/items/properties/error": ["string"],
            },
        });
    },
    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" } as const,
);

export type MethodReturnType_userFees = Awaited<ReturnType<InfoClient["userFees"]>>;
run(
    "userFees",
    async (types, { user }) => {
        const data = await infoClient.userFees({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0xe973105a27e17350500926ae664dfcfe6006d924" } as const,
);

export type MethodReturnType_userFills = Awaited<ReturnType<InfoClient["userFills"]>>;
run(
    "userFills",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.userFills({ user }),
            // Check argument 'aggregateByTime'
            infoClient.userFills({ user, aggregateByTime: true }),
            infoClient.userFills({ user, aggregateByTime: false }),
            infoClient.userFills({ user, aggregateByTime: undefined }),
        ]);
        schemaCoverage(types, data);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userFillsByTime = Awaited<ReturnType<InfoClient["userFillsByTime"]>>;
run(
    "userFillsByTime",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.userFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
            // Check argument 'endTime'
            infoClient.userFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            }),
            infoClient.userFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: null,
            }),
            infoClient.userFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: undefined,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userFunding = Awaited<ReturnType<InfoClient["userFunding"]>>;
run(
    "userFunding",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.userFunding({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
            // Check argument 'endTime'
            infoClient.userFunding({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            }),
            infoClient.userFunding({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: null,
            }),
            infoClient.userFunding({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: undefined,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" } as const,
);

export type MethodReturnType_userNonFundingLedgerUpdates = Awaited<
    ReturnType<InfoClient["userNonFundingLedgerUpdates"]>
>;
run(
    "userNonFundingLedgerUpdates",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.userNonFundingLedgerUpdates({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
            // Check argument 'endTime'
            infoClient.userNonFundingLedgerUpdates({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            }),
            infoClient.userNonFundingLedgerUpdates({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: null,
            }),
            infoClient.userNonFundingLedgerUpdates({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: undefined,
            }),
        ]);
        schemaCoverage(types, data, {
            ignoreEnumValuesByPath: {
                "#/items/properties/delta/anyOf/3/properties/leverageType": ["Cross"],
            },
        });
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userRateLimit = Awaited<ReturnType<InfoClient["userRateLimit"]>>;
run(
    "userRateLimit",
    async (types, { user }) => {
        const data = await infoClient.userRateLimit({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userRole = Awaited<ReturnType<InfoClient["userRole"]>>;
run(
    "userRole",
    async (types, { role }) => {
        const data = await Promise.all([
            infoClient.userRole({ user: role.missing }),
            infoClient.userRole({ user: role.user }),
            infoClient.userRole({ user: role.agent }),
            infoClient.userRole({ user: role.vault }),
            infoClient.userRole({ user: role.sub_account }),
        ]);
        schemaCoverage(types, data);
    },
    {
        role: {
            missing: "0x941a505ACc11F5f3A12b5eF0d414A8Bff45c5e77",
            user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
            agent: "0xDF1bC1bA4242a47f2AeC1Cd52F9E24b243107a34",
            vault: "0xd0d0eb5de91f14e53312adf92cabcbbfd2b4f24f",
            sub_account: "0x22a454d3322060475552e8f922ec0c778b8e5760",
        },
    } as const,
);

export type MethodReturnType_userToMultiSigSigners = Awaited<ReturnType<InfoClient["userToMultiSigSigners"]>>;
run(
    "userToMultiSigSigners",
    async (types, { address }) => {
        const data = await Promise.all([
            infoClient.userToMultiSigSigners({ user: address.withoutMultiSigSigners }),
            infoClient.userToMultiSigSigners({ user: address.withMultiSigSigners }),
        ]);
        schemaCoverage(types, data);
    },
    {
        address: {
            withMultiSigSigners: "0x7A8b673a176a430b80cfCDfdFB6b10ED55010Ebb",
            withoutMultiSigSigners: "0x563C175E6f11582f65D6d9E360A618699DEe14a9",
        },
    } as const,
);

export type MethodReturnType_userTwapSliceFills = Awaited<ReturnType<InfoClient["userTwapSliceFills"]>>;
run(
    "userTwapSliceFills",
    async (types, { user }) => {
        const data = await infoClient.userTwapSliceFills({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userTwapSliceFillsByTime = Awaited<ReturnType<InfoClient["userTwapSliceFillsByTime"]>>;
run(
    "userTwapSliceFillsByTime",
    async (types, { user }) => {
        const data = await Promise.all([
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
            }),
            // Check argument 'endTime'
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: Date.now(),
            }),
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: null,
            }),
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                endTime: undefined,
            }),
            // Check argument 'aggregateByTime'
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                aggregateByTime: true,
            }),
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                aggregateByTime: false,
            }),
            infoClient.userTwapSliceFillsByTime({
                user,
                startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                aggregateByTime: undefined,
            }),
        ]);
        schemaCoverage(types, data);
    },
    { user: "0x563C175E6f11582f65D6d9E360A618699DEe14a9" } as const,
);

export type MethodReturnType_userVaultEquities = Awaited<ReturnType<InfoClient["userVaultEquities"]>>;
run(
    "userVaultEquities",
    async (types, { user }) => {
        const data = await infoClient.userVaultEquities({ user });
        schemaCoverage(types, [data]);
    },
    { user: "0xe019d6167E7e324aEd003d94098496b6d986aB05" } as const,
);

export type MethodReturnType_validatorL1Votes = Awaited<ReturnType<InfoClient["validatorL1Votes"]>>;
run(
    "validatorL1Votes",
    async (types) => {
        const data = await infoClient.validatorL1Votes();
        schemaCoverage(types, [data], { ignoreEmptyArrayPaths: ["#"] });
    },
);

export type MethodReturnType_validatorSummaries = Awaited<ReturnType<InfoClient["validatorSummaries"]>>;
run(
    "validatorSummaries",
    async (types) => {
        const data = await infoClient.validatorSummaries();
        schemaCoverage(types, [data]);
    },
);

export type MethodReturnType_vaultDetails = Awaited<ReturnType<InfoClient["vaultDetails"]>>;
run(
    "vaultDetails",
    async (types, { vault }) => {
        const data = await Promise.all([
            infoClient.vaultDetails({ vaultAddress: vault.invalid }),
            infoClient.vaultDetails({ vaultAddress: vault.withNormalRelationship }),
            infoClient.vaultDetails({
                vaultAddress: vault.withParentRelationship.vault,
                user: vault.withParentRelationship.user,
            }),
            infoClient.vaultDetails({ vaultAddress: vault.withChildRelationship }),
        ]);
        schemaCoverage(types, data);
    },
    {
        vault: {
            invalid: "0x0000000000000000000000000000000000000000",
            withNormalRelationship: "0x1719884eb866cb12b2287399b15f7db5e7d775ea",
            withParentRelationship: {
                vault: "0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0",
                user: "0xe019d6167E7e324aEd003d94098496b6d986aB05",
            },
            withChildRelationship: "0x768484f7e2ebb675c57838366c02ae99ba2a9b08",
        },
    } as const,
);

export type MethodReturnType_vaultSummaries = Awaited<ReturnType<InfoClient["vaultSummaries"]>>;
run(
    "vaultSummaries",
    async (types) => {
        const data = await infoClient.vaultSummaries();
        schemaCoverage(types, [data], {
            ignoreBranchesByPath: {
                "#/items/properties/relationship/anyOf": [1],
            },
            ignoreEnumValuesByPath: {
                "#/items/properties/relationship/anyOf/0/properties/type": ["child"],
            },
            ignoreEmptyArrayPaths: ["#"],
        });
    },
);
