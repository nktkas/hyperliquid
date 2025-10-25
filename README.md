# Hyperliquid API TypeScript SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@nktkas/hyperliquid?style=flat-square&color=blue)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![Downloads](https://img.shields.io/npm/dm/@nktkas/hyperliquid.svg?style=flat-square)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![jsr](https://jsr.io/badges/@nktkas/hyperliquid?style=flat-square)](https://jsr.io/@nktkas/hyperliquid)
[![coveralls](https://img.shields.io/coverallsCoverage/github/nktkas/hyperliquid?style=flat-square)](https://coveralls.io/github/nktkas/hyperliquid)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/@nktkas/hyperliquid?style=flat-square)](https://bundlephobia.com/package/@nktkas/hyperliquid)

Unofficial [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all major JS
runtimes, written in TypeScript.

## Features

- 🖋️ **Typed**: Source code is 100% TypeScript.
- 🧪 **Tested**: Good code coverage and type relevance.
- 📦 **Minimal dependencies**: A few small trusted dependencies.
- 🌐 **Cross-Environment Support**: Compatible with all major JS runtimes.
- 🔧 **Integratable**: Easy to use with wallet providers ([viem](https://github.com/wevm/viem) or
  [ethers](https://github.com/ethers-io/ethers.js)).
- 📚 **Documented**: JSDoc annotations with usage examples.
- 🌲 [**Tree-shaking friendly**](#tree-shaking-api-functions): Easily import only the API calls you use for minimal
  bundle size.

## Installation

> [!NOTE]
> While this library is in TypeScript, it can also be used in JavaScript and supports ESM/CommonJS.

### Node.js v20+ (choose your package manager)

```
npm i @nktkas/hyperliquid

pnpm add @nktkas/hyperliquid

yarn add @nktkas/hyperliquid
```

If you are using a version of **Node.js lower than v22** and intend to use [`WebSocketTransport`](#websocket-transport),
you need to install the [`ws`](https://www.npmjs.com/package/ws) package and pass the `WebSocket` class to the
constructor:

```ts
import WebSocket from "ws"; // install `ws` package
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.WebSocketTransport({
  reconnect: {
    WebSocket, // pass `WebSocket` class from `ws` package
  },
});
```

### Deno v2.0+

```
deno add jsr:@nktkas/hyperliquid
```

### Web

The SDK is fully browser-compatible; integrate it via CDN or bundle it with your application.

```html
<script type="module">
  import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid";
</script>
```

### React Native v0.74.5 / Expo v51

For React Native, you need to import polyfills before importing the SDK:

```ts
import "fast-text-encoding"; // `TextEncoder` (utf-8)
import "event-target-polyfill"; // `EventTarget`, `Event`
import * as hl from "@nktkas/hyperliquid";
```

## Quick Start

### CLI

The SDK includes a command-line interface for quick interactions with Hyperliquid API without writing code.

```bash
npx @nktkas/hyperliquid --help
```

### [Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with transport
const infoClient = new hl.InfoClient({
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// 3. Query data
const openOrders = await infoClient.openOrders({ user: "0x..." });
```

### [Exchange endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with wallet and transport
const exchClient = new hl.ExchangeClient({
  wallet: "0x...", // `viem`, `ethers`, or private key directly
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// 3. Execute an action
const result = await exchClient.order({
  orders: [{
    a: 0,
    b: true,
    p: "30000",
    s: "0.1",
    r: false,
    t: {
      limit: {
        tif: "Gtc",
      },
    },
  }],
  grouping: "na",
});
```

### [Subscription](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with transport
const subsClient = new hl.SubscriptionClient({
  transport: new hl.WebSocketTransport(),
});

// 3. Subscribe to events
const sub = await subsClient.allMids((event) => {
  console.log(event);
});
await sub.unsubscribe();
```

### [Multi-Sign](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with transport, multi-sign address, and signers
const multiSignClient = new hl.MultiSignClient({
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
  multiSigUser: "0x...",
  signers: [
    "0x...", // `viem`, `ethers`, or private key directly
    // ... (more signers if needed)
  ],
});

// 3. Execute an action (same as `ExchangeClient`)
await multiSignClient.approveAgent({ agentAddress: "0x..." });
```

## Usage

### 1) Initialize Transport

First, choose and configure your transport layer (more details in the [Transports](#transports)):

```ts
import * as hl from "@nktkas/hyperliquid";

// 1. HTTP Transport: suitable for one-time requests or serverless environments
const httpTransport = new hl.HttpTransport({ ... }); // Accepts optional parameters (e.g. isTestnet, timeout, etc.)

// 2. WebSocket Transport: has better network latency than HTTP transport
const wsTransport = new hl.WebSocketTransport({ ... }); // Accepts optional parameters (e.g. isTestnet, timeout, reconnect, etc.)
```

### 2) Initialize Client

Next, initialize a client with the transport layer (more details in the [Clients](#clients)):

#### Create [InfoClient](#infoclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const infoClient = new hl.InfoClient({
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
});
```

#### Create [ExchangeClient](#exchangeclient)

```ts
import * as hl from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";

const transport = new hl.HttpTransport(); // or `WebSocketTransport`

// 1. Using private key directly
const privateKey = "0x...";
const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });

// 2. Using Viem
const viemAccount = privateKeyToAccount("0x...");
const exchClient = new hl.ExchangeClient({ wallet: viemAccount, transport });

// 3. Using Ethers
const ethersWallet = new ethers.Wallet("0x...");
const exchClient = new hl.ExchangeClient({ wallet: ethersWallet, transport });

// 4. Using external wallet (e.g. MetaMask) via Viem
const [account] = await window.ethereum.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const externalWallet = createWalletClient({ account, transport: custom(window.ethereum) });
const exchClient = new hl.ExchangeClient({ wallet: externalWallet, transport });
```

#### Create [SubscriptionClient](#subscriptionclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const subsClient = new hl.SubscriptionClient({
  transport: new hl.WebSocketTransport(),
});
```

#### Create [MultiSignClient](#multisignclient)

```ts
import * as hl from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";

const multiSignClient = new hl.MultiSignClient({
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
  multiSigUser: "0x...",
  signers: [
    privateKeyToAccount("0x..."), // leader (first signer), signs the transaction twice
    new ethers.Wallet("0x..."),
    { // can be a custom async wallet
      async signTypedData(params: {
        domain: {
          name: string;
          version: string;
          chainId: number;
          verifyingContract: Hex;
        };
        types: {
          [key: string]: {
            name: string;
            type: string;
          }[];
        };
        primaryType: string;
        message: Record<string, unknown>;
      }): Promise<Hex> {
        // Custom signer logic
        return "0x..."; // return hex signature
      },
    },
    "0x...", // private key directly
    // ... more signers
  ],
});
```

### 3) Use Client

Finally, use client methods to interact with the Hyperliquid API (more details in the [API Reference](#clients)):

#### Example of using an [InfoClient](#infoclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const infoClient = new hl.InfoClient({
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// L2 Book
const l2Book = await infoClient.l2Book({ coin: "ETH" });

// User clearinghouse state
const clearinghouseState = await infoClient.clearinghouseState({ user: "0x..." });

// User open orders
const openOrders = await infoClient.openOrders({ user: "0x..." });
```

#### Example of using an [ExchangeClient](#exchangeclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const exchClient = new hl.ExchangeClient({
  wallet: "0x...", // `viem`, `ethers`, or private key directly
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// Place an order
const result = await exchClient.order({
  orders: [{
    a: 0,
    b: true,
    p: "30000",
    s: "0.1",
    r: false,
    t: {
      limit: {
        tif: "Gtc",
      },
    },
  }],
  grouping: "na",
});

// Approve an agent
const result = await exchClient.approveAgent({ agentAddress: "0x..." });

// Withdraw funds
const result = await exchClient.withdraw3({ destination: "0x...", amount: "100" });
```

#### Example of using a [SubscriptionClient](#subscriptionclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const subsClient = new hl.SubscriptionClient({
  transport: new hl.WebSocketTransport(),
});

// L2 Book updates
await subsClient.l2Book({ coin: "ETH" }, (data) => {
  console.log(data);
});

// User fills
await subsClient.userFills({ user: "0x..." }, (data) => {
  console.log(data);
});

// Candle updates
await subsClient.candle({ coin: "ETH", interval: "1h" }, (data) => {
  console.log(data);
});
```

#### Example of using a [MultiSignClient](#multisignclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const multiSignClient = new hl.MultiSignClient({
  transport: new hl.HttpTransport(), // or `WebSocketTransport`
  multiSigUser: "0x...",
  signers: [
    "0x...", // `viem`, `ethers`, or private key directly
    // ... (more signers if needed)
  ],
});

// Interaction is the same as with `ExchangeClient`
```

## API Reference

### Clients

A client is an interface through which you can interact with the Hyperliquid API.

#### InfoClient

```ts
class InfoClient {
  constructor(args: {
    transport: HttpTransport | WebSocketTransport;
  });

  // Market Data
  alignedQuoteTokenInfo(params: AlignedQuoteTokenInfoParameters): Promise<AlignedQuoteTokenInfoResponse>;
  allMids(params?: AllMidsParameters): Promise<AllMidsResponse>;
  candleSnapshot(params: CandleSnapshotParameters): Promise<CandleSnapshotResponse>;
  fundingHistory(params: FundingHistoryParameters): Promise<FundingHistoryResponse>;
  l2Book(params: L2BookParameters): Promise<L2BookResponse>;
  liquidatable(): Promise<LiquidatableResponse>;
  marginTable(params: MarginTableParameters): Promise<MarginTableResponse>;
  maxMarketOrderNtls(): Promise<MaxMarketOrderNtlsResponse>;
  meta(params?: MetaParameters): Promise<MetaResponse>;
  metaAndAssetCtxs(params?: MetaAndAssetCtxsParameters): Promise<MetaAndAssetCtxsResponse>;
  perpDexLimits(params: PerpDexLimitsParameters): Promise<PerpDexLimitsResponse>;
  perpDexs(): Promise<PerpDexsResponse>;
  perpsAtOpenInterestCap(params?: PerpsAtOpenInterestCapParameters): Promise<PerpsAtOpenInterestCapResponse>;
  predictedFundings(): Promise<PredictedFundingsResponse>;
  recentTrades(params: RecentTradesParameters): Promise<RecentTradesResponse>;
  spotMeta(): Promise<SpotMetaResponse>;
  spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxsResponse>;

  // User Account
  activeAssetData(params: ActiveAssetDataParameters): Promise<ActiveAssetDataResponse>;
  clearinghouseState(params: ClearinghouseStateParameters): Promise<ClearinghouseStateResponse>;
  extraAgents(params: ExtraAgentsParameters): Promise<ExtraAgentsResponse>;
  isVip(params: IsVipParameters): Promise<IsVipResponse>;
  legalCheck(params: LegalCheckParameters): Promise<LegalCheckResponse>;
  maxBuilderFee(params: MaxBuilderFeeParameters): Promise<MaxBuilderFeeResponse>;
  portfolio(params: PortfolioParameters): Promise<PortfolioResponse>;
  preTransferCheck(params: PreTransferCheckParameters): Promise<PreTransferCheckResponse>;
  referral(params: ReferralParameters): Promise<ReferralResponse>;
  spotClearinghouseState(params: SpotClearinghouseStateParameters): Promise<SpotClearinghouseStateResponse>;
  subAccounts(params: SubAccountsParameters): Promise<SubAccountsResponse>;
  userDexAbstraction(params: UserDexAbstractionInfoParameters): Promise<UserDexAbstractionInfoResponse>;
  userFees(params: UserFeesParameters): Promise<UserFeesResponse>;
  userFunding(params: UserFundingParameters): Promise<UserFundingResponse>;
  userNonFundingLedgerUpdates(
    params: UserNonFundingLedgerUpdatesParameters,
  ): Promise<UserNonFundingLedgerUpdatesResponse>;
  userRateLimit(params: UserRateLimitParameters): Promise<UserRateLimitResponse>;
  userRole(params: UserRoleParameters): Promise<UserRoleResponse>;
  userToMultiSigSigners(params: UserToMultiSigSignersParameters): Promise<UserToMultiSigSignersResponse>;
  webData2(params: WebData2Parameters): Promise<WebData2Response>;

  // Orders & TWAP & Position
  frontendOpenOrders(params: FrontendOpenOrdersParameters): Promise<FrontendOpenOrdersResponse>;
  historicalOrders(params: HistoricalOrdersParameters): Promise<HistoricalOrdersResponse>;
  openOrders(params: OpenOrdersParameters): Promise<OpenOrdersResponse>;
  orderStatus(params: OrderStatusParameters): Promise<OrderStatusResponse>;
  twapHistory(params: TwapHistoryParameters): Promise<TwapHistoryResponse>;
  userFills(params: UserFillsParameters): Promise<UserFillsResponse>;
  userFillsByTime(params: UserFillsByTimeParameters): Promise<UserFillsByTimeResponse>;
  userTwapSliceFills(params: UserTwapSliceFillsParameters): Promise<UserTwapSliceFillsResponse>;
  userTwapSliceFillsByTime(params: UserTwapSliceFillsByTimeParameters): Promise<UserTwapSliceFillsByTimeResponse>;

  // Delegation & Validators
  delegations(params: DelegationsParameters): Promise<DelegationsResponse>;
  delegatorHistory(params: DelegatorHistoryParameters): Promise<DelegatorHistoryResponse>;
  delegatorRewards(params: DelegatorRewardsParameters): Promise<DelegatorRewardsResponse>;
  delegatorSummary(params: DelegatorSummaryParameters): Promise<DelegatorSummaryResponse>;
  gossipRootIps(): Promise<GossipRootIpsResponse>;
  validatorL1Votes(): Promise<ValidatorL1VotesResponse>;
  validatorSummaries(): Promise<ValidatorSummariesResponse>;

  // Vault
  leadingVaults(params: LeadingVaultsParameters): Promise<LeadingVaultsResponse>;
  userVaultEquities(params: UserVaultEquitiesParameters): Promise<UserVaultEquitiesResponse>;
  vaultDetails(params: VaultDetailsParameters): Promise<VaultDetailsResponse>;
  vaultSummaries(): Promise<VaultSummariesResponse>;

  // Deploy Market
  perpDeployAuctionStatus(): Promise<PerpDeployAuctionStatusResponse>;
  spotDeployState(params: SpotDeployStateParameters): Promise<SpotDeployStateResponse>;
  spotPairDeployAuctionStatus(): Promise<SpotPairDeployAuctionStatusResponse>;

  // Other
  exchangeStatus(): Promise<ExchangeStatusResponse>;

  // Transaction & Block Details (RPC endpoint)
  blockDetails(params: BlockDetailsParameters): Promise<BlockDetailsResponse>;
  txDetails(params: TxDetailsParameters): Promise<TxDetailsResponse>;
  userDetails(params: UserDetailsParameters): Promise<UserDetailsResponse>;
  tokenDetails(params: TokenDetailsParameters): Promise<TokenDetailsResponse>;
}
```

#### ExchangeClient

```ts
class ExchangeClient {
  constructor(args: {
    transport: HttpTransport | WebSocketTransport;
    wallet: AbstractWallet | Hex; // viem, ethers or private key directly
    defaultVaultAddress?: Hex; // Vault address used by default if not provided in method call
    signatureChainId?: Hex | (() => MaybePromise<Hex>); // Chain ID used for signing (default: get chain id from wallet otherwise `0x1`)
    nonceManager?: () => MaybePromise<number>; // Function to get the next nonce (default: monotonically incrementing `Date.now()`)
  });

  // Order & TWAP & Position
  batchModify(params: BatchModifyParameters): Promise<OrderResponseSuccess>;
  cancel(params: CancelParameters): Promise<CancelResponseSuccess>;
  cancelByCloid(params: CancelByCloidParameters): Promise<CancelResponseSuccess>;
  modify(params: ModifyParameters): Promise<SuccessResponse>;
  order(params: OrderParameters): Promise<OrderResponseSuccess>;
  scheduleCancel(params?: ScheduleCancelParameters): Promise<SuccessResponse>;
  twapCancel(params: TwapCancelParameters): Promise<TwapCancelResponseSuccess>;
  twapOrder(params: TwapOrderParameters): Promise<TwapOrderResponseSuccess>;
  updateIsolatedMargin(params: UpdateIsolatedMarginParameters): Promise<SuccessResponse>;
  updateLeverage(params: UpdateLeverageParameters): Promise<SuccessResponse>;

  // Account
  agentEnableDexAbstraction(): Promise<SuccessResponse>;
  approveAgent(params: ApproveAgentParameters): Promise<SuccessResponse>;
  approveBuilderFee(params: ApproveBuilderFeeParameters): Promise<SuccessResponse>;
  evmUserModify(params: EvmUserModifyParameters): Promise<SuccessResponse>;
  noop(): Promise<SuccessResponse>;
  reserveRequestWeight(params: ReserveRequestWeightParameters): Promise<SuccessResponse>;
  setDisplayName(params: SetDisplayNameParameters): Promise<SuccessResponse>;
  spotUser(params: SpotUserParameters): Promise<SuccessResponse>;
  userDexAbstraction(params: UserDexAbstractionExchangeParameters): Promise<UserDexAbstractionExchangeResponse>;

  // Fund Transfers
  sendAsset(params: SendAssetParameters): Promise<SuccessResponse>;
  spotSend(params: SpotSendParameters): Promise<SuccessResponse>;
  usdClassTransfer(params: UsdClassTransferParameters): Promise<SuccessResponse>;
  usdSend(params: UsdSendParameters): Promise<SuccessResponse>;
  withdraw3(params: Withdraw3Parameters): Promise<SuccessResponse>;

  // Sub-Account
  createSubAccount(params: CreateSubAccountParameters): Promise<CreateSubAccountResponse>;
  subAccountModify(params: SubAccountModifyParameters): Promise<SuccessResponse>;
  subAccountSpotTransfer(params: SubAccountSpotTransferParameters): Promise<SuccessResponse>;
  subAccountTransfer(params: SubAccountTransferParameters): Promise<SuccessResponse>;

  // Referrer
  claimRewards(): Promise<SuccessResponse>;
  registerReferrer(params: RegisterReferrerParameters): Promise<SuccessResponse>;
  setReferrer(params: SetReferrerParameters): Promise<SuccessResponse>;

  // Staking & Delegation
  cDeposit(params: CDepositParameters): Promise<SuccessResponse>;
  cWithdraw(params: CWithdrawParameters): Promise<SuccessResponse>;
  tokenDelegate(params: TokenDelegateParameters): Promise<SuccessResponse>;

  // Vault
  createVault(params: CreateVaultParameters): Promise<CreateVaultResponse>;
  vaultDistribute(params: VaultDistributeParameters): Promise<SuccessResponse>;
  vaultModify(params: VaultModifyParameters): Promise<SuccessResponse>;
  vaultTransfer(params: VaultTransferParameters): Promise<SuccessResponse>;

  // Multi-Sign
  convertToMultiSigUser(params: ConvertToMultiSigUserParameters): Promise<SuccessResponse>;
  multiSig(params: MultiSigParameters): Promise<
    | SuccessResponse
    | CancelSuccessResponse
    | CreateSubAccountResponse
    | CreateVaultResponse
    | OrderSuccessResponse
    | TwapOrderSuccessResponse
    | TwapCancelSuccessResponse
  >;

  // Deploy Market
  perpDeploy(params: PerpDeployParameters): Promise<SuccessResponse>;
  spotDeploy(params: SpotDeployParameters): Promise<SuccessResponse>;

  // Validator Actions
  cSignerAction(params: CSignerActionParameters): Promise<SuccessResponse>;
  cValidatorAction(params: CValidatorActionParameters): Promise<SuccessResponse>;
}
```

#### SubscriptionClient

```ts
class SubscriptionClient {
  constructor(args: {
    transport: WebSocketTransport;
  });

  // Market
  activeAssetCtx(params: WsActiveAssetCtxParameters, listener: (data: WsActiveAssetCtxEvent) => void);
  activeSpotAssetCtx(params: WsActiveSpotAssetCtxParameters, listener: (data: WsActiveSpotAssetCtxEvent) => void);
  allMids(params?: WsAllMidsParameters, listener: (data: WsAllMidsEvent) => void);
  assetCtxs(params?: WsAssetCtxsParameters, listener: (data: WsAssetCtxsEvent) => void);
  bbo(params: WsBboParameters, listener: (data: WsBboEvent) => void);
  candle(params: WsCandleParameters, listener: (data: WsCandleEvent) => void);
  l2Book(params: WsL2BookParameters, listener: (data: WsL2BookEvent) => void);
  trades(params: WsTradesParameters, listener: (data: WsTradesEvent) => void);

  // Account
  activeAssetData(params: WsActiveAssetDataParameters, listener: (data: WsActiveAssetDataEvent) => void);
  clearinghouseState(params: WsClearinghouseStateParameters, listener: (data: WsClearinghouseStateEvent) => void);
  notification(params: WsNotificationParameters, listener: (data: WsNotificationEvent) => void);
  userEvents(params: WsUserEventsParameters, listener: (data: WsUserEventsEvent) => void);
  userFundings(params: WsUserFundingsParameters, listener: (data: WsUserFundingsEvent) => void);
  userHistoricalOrders(params: WsUserHistoricalOrdersParameters, listener: (data: WsUserHistoricalOrdersEvent) => void);
  userNonFundingLedgerUpdates(
    params: WsUserNonFundingLedgerUpdatesParameters,
    listener: (data: WsUserNonFundingLedgerUpdatesEvent) => void,
  );
  webData2(params: WsWebData2Parameters, listener: (data: WsWebData2Event) => void);

  // Order
  openOrders(params: WsOpenOrdersParameters, listener: (data: WsOpenOrdersEvent) => void);
  orderUpdates(params: WsOrderUpdatesParameters, listener: (data: WsOrderUpdatesEvent) => void);
  userFills(params: WsUserFillsParameters, listener: (data: WsUserFillsEvent) => void);
  userTwapHistory(params: WsUserTwapHistoryParameters, listener: (data: WsUserTwapHistoryEvent) => void);
  userTwapSliceFills(params: WsUserTwapSliceFillsParameters, listener: (data: WsUserTwapSliceFillsEvent) => void);

  // Transaction & Block Details (RPC endpoint)
  explorerBlock(listener: (data: WsExplorerBlockEvent) => void);
  explorerTxs(listener: (data: WsExplorerTxsEvent) => void);
}
```

#### MultiSignClient

```ts
class MultiSignClient extends ExchangeClient {
  constructor(
    args: {
      // ... same params as in `ExchangeClient` except `wallet`
      // and
      multiSigUser: Hex;
      signers: [
        AbstractWallet | Hex, // leader (first signer), signs the transaction twice
        ...(AbstractWallet | Hex)[], // ... more signers
      ];
    },
  );

  // Same methods as `ExchangeClient`
}
```

### Transports

Transport is a layer between class/function requests and Hyperliquid servers.

#### HTTP Transport

Uses [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for requests. Supports
[Info](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) /
[Exchange](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint) / Explorer endpoints.

**Features:**

- Can change any settings in the created instance without creating a new instance (e.g. switch between mainnet/testnet).
- Intercepting and modifying requests/responses/errors using on* functions.

```ts
class HttpTransport {
  constructor(options?: {
    /** Whether to use testnet url (default: false) */
    isTestnet?: boolean;
    /** Request timeout in ms (default: 10_000) */
    timeout?: number;
    /** Custom server URLs */
    server?: {
      mainnet?: { api?: string | URL; rpc?: string | URL };
      testnet?: { api?: string | URL; rpc?: string | URL };
    };
    /** Custom fetch options */
    fetchOptions?: RequestInit;
    /** Callback before request is sent */
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>;
    /** Callback after response is received */
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>;
    /** Callback on error during fetching */
    onError?: (error: unknown) => MaybePromise<Error | void | null | undefined>;
  });
}
```

#### WebSocket Transport

Uses [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) for requests. Supports
[subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) and
[post requests](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests).

**Features:**

- Automatically restores connection after loss and resubscribes to previous subscriptions.
- Smart keep alive (pings only when idle).
- Lazy initialization with message buffering during connection establishment.

**Limitations:**

- 1 instance = 1 immutable endpoint. Cannot mix api/explorer endpoints or mainnet/testnet in single connection. Need to
  create separate instances for different endpoints.
- Cannot send explorer post-requests, only explorer subscriptions.

```ts
class WebSocketTransport {
  constructor(options?: {
    /** Indicates this transport uses testnet endpoint (default: false) */
    isTestnet?: boolean;
    /**
     * Custom WebSocket endpoint for API and Subscription requests.
     * (default: `wss://api.hyperliquid.xyz/ws` for `isTestnet` = false, `wss://api.hyperliquid-testnet.xyz/ws` for `isTestnet` = true)
     */
    url?: string | URL;
    /** Timeout for requests in ms (default: 10_000) */
    timeout?: number;
    /** Interval between sending ping messages in ms (default: 30_000) */
    keepAliveInterval?: number;
    /** Reconnection policy configuration for closed connections */
    reconnect?: {
      /** Custom WebSocket constructor (default: global WebSocket) */
      WebSocket?: new (url: string | URL) => WebSocket;
      /** Maximum number of reconnection attempts (default: 3) */
      maxRetries?: number;
      /** Maximum time in ms to wait for a connection to open (default: 10_000) */
      connectionTimeout?: number;
      /** Delay before reconnection in ms (default: Exponential backoff (max 10s)) */
      reconnectionDelay?: number | ((attempt: number) => number);
    };
    /** Enable automatic re-subscription to Hyperliquid subscription after reconnection (default: true) */
    resubscribe?: boolean;
  });
  ready(signal?: AbortSignal): Promise<void>;
  close(signal?: AbortSignal): Promise<void>;
}
```

### Errors

All SDK errors extend from `HyperliquidError` base class for unified error handling:

```ts
import { ApiRequestError, HyperliquidError, SchemaError, TransportError } from "@nktkas/hyperliquid";

try {
    await exchClient.order({ ... });
} catch (error) {
    if (error instanceof SchemaError) {
        // Invalid data format (before sending request)
    } else if (error instanceof ApiRequestError) {
        // API returned error (e.g., insufficient funds)
    } else if (error instanceof TransportError) {
        // Network/connection failure (e.g., timeout)
    } else if (error instanceof HyperliquidError) {
        // Some other Hyperliquid SDK error
    }
}
```

## Additional Import Points

### `/signing`

This module contains functions for generating Hyperliquid transaction signatures.

#### L1 Action

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { CancelRequest, parser } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // viem or ethers

const action = parser(CancelRequest.entries.action)({ // for correct signature generation
  type: "cancel",
  cancels: [
    { a: 0, o: 12345 },
  ],
});
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

// Send the signed action to the Hyperliquid API
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
const body = await response.json();
```

#### User Signed Action

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentRequest, ApproveAgentTypes, parser } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // viem or ethers

const action = parser(ApproveAgentRequest.entries.action)({ // for correct signature generation
  type: "approveAgent",
  signatureChainId: "0x66eee",
  hyperliquidChain: "Mainnet",
  agentAddress: "0x...",
  agentName: "Agent",
  nonce: Date.now(),
});

const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });

// Send the signed action to the Hyperliquid API
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
const body = await response.json();
```

### `/api`

This module contains raw functions for interacting with the Hyperliquid API and
[valibot](https://github.com/fabian-hiller/valibot) schemas for API requests/responses.

#### Tree-shaking API functions

You can use raw functions to maximize tree-shaking in your app. This is useful if you are pedantic about bundle size and
want to only include the API calls you use.

##### `/api/info`

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { clearinghouseState } from "@nktkas/hyperliquid/api/info";
//       ^^^^^^^^^^^^^^^^^^
//       same name as in `InfoClient`

const transport = new HttpTransport(); // or `WebSocketTransport`
const data = await clearinghouseState(
  { transport }, // same params as in `InfoClient`
  { user: "0x..." },
);
```

##### `/api/exchange`

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";
import { order } from "@nktkas/hyperliquid/api/exchange";
//       ^^^^^
//       same name as in `ExchangeClient`

const wallet = privateKeyToAccount("0x..."); // viem or ethers
const transport = new HttpTransport(); // or `WebSocketTransport`

const data = await order(
  { transport, wallet }, // same params as in `ExchangeClient` or `MultiSignClient`
  {
    orders: [
      {
        a: 0,
        b: true,
        p: "30000",
        s: "0.1",
        r: false,
        t: { limit: { tif: "Gtc" } },
        c: "0x...",
      },
    ],
    grouping: "na",
  },
);
```

##### `/api/subscription`

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";
import { candle } from "@nktkas/hyperliquid/api/subscription";
//       ^^^^^^
//       same name as in `SubscriptionClient`

const transport = new WebSocketTransport();

const sub = await candle(
  { transport }, // same params as in `SubscriptionClient`
  { coin: "ETH", interval: "1h" },
  (data) => console.log(data),
);
```

#### Valibot Schemas

Another way to use this module is to access [valibot](https://github.com/fabian-hiller/valibot) schemas for API
requests/responses. For example, to validate data and sort object keys before creating a signature.

```ts
import { OrderRequest, parser } from "@nktkas/hyperliquid/api/exchange";
//       ^^^^^^^^^^^^
//       both a valibot schema and a typescript type

const action = {
  type: "order",
  orders: [{
    a: 0,
    b: true,
    p: "50000",
    s: "0.1",
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
} satisfies OrderRequest["action"]; // can be used as type

//                             or as valibot schema
//                             ⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄
const validatedAction = parser(OrderRequest.entries.action)(action);
//                      ^^^^^^
//                      validates, formats, sorts object keys for correct signature generation
//                      and returns typed data
```

Also valibot schema can be converted to JSON Schema (e.g. for generating OpenAPI spec):

```ts
import { OrderRequest } from "@nktkas/hyperliquid/api/exchange";
import { toJsonSchema } from "@valibot/to-json-schema";

const schema = toJsonSchema(OrderRequest, { errorMode: "ignore", typeMode: "output" });

console.log(JSON.stringify(schema, null, 2));
// {
//   "$schema": "http://json-schema.org/draft-07/schema#",
//   "type": "object",
//   "properties": {
//     "action": {
//       "type": "object",
//       "properties": {
//         "type": { "const": "order" },
//         "orders": { "type": "array", "items": {...} },
//         "grouping": { "anyOf": [...] },
//         "builder": { "type": "object", ... }
//       },
//       "required": ["type", "orders", "grouping"]
//     },
//     "nonce": { "type": "number" },
//     "signature": {
//       "type": "object",
//       "properties": {
//         "r": { "type": "string", ... },
//         "s": { "type": "string", ... },
//         "v": { "anyOf": [{"const": 27}, {"const": 28}] }
//       },
//       "required": ["r", "s", "v"]
//     },
//     "vaultAddress": { "type": "string", ... },
//     "expiresAfter": { "type": "number" }
//   },
//   "required": ["action", "nonce", "signature"]
// }
```

### `/utils`

This module contains helper functions for interacting with the HyperLiquid API.

#### `SymbolConverter`

Utility class for converting asset symbols to their corresponding IDs and size decimals. See
[docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids).

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";

const transport = new HttpTransport(); // or `WebSocketTransport`
const converter = await SymbolConverter.create({ transport });

const btcId = converter.getAssetId("BTC"); // perpetual → 0
const hypeUsdcId = converter.getAssetId("HYPE/USDC"); // spot market → 10107
const dexAbcId = converter.getAssetId("test:ABC"); // builder dex (if enabled) → 110000

const btcSzDecimals = converter.getSzDecimals("BTC"); // perpetual → 5
const hypeUsdcSzDecimals = converter.getSzDecimals("HYPE/USDC"); // spot market → 2
const dexAbcSzDecimals = converter.getSzDecimals("test:ABC"); // builder dex (if enabled) → 0
```

## FAQ

### How to execute an L1 action via an external wallet (e.g. MetaMask)?

Hyperliquid requires chain `1337` for L1 action signatures. To handle this with external wallets:

- (recommended) Create an
  [Agent Wallet](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets)
  and execute all L1 actions through it
- Change a user's chain to `1337`, however, the user will sign unreadable data

### How to create a market order?

Hyperliquid doesn't have traditional market orders, but you can achieve market-like execution by placing limit order
with `tif: "Ioc"` and price that guarantee immediate execution:

- For buys: set limit price >= current best ask
- For sells: set limit price <= current best bid

### How to use the [Agent Wallet](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets)?

Use agent's private key instead of master account's private key.

### How to use the [Vault](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults) / [Sub-Account](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults)?

Pass vault or sub-account address via `vaultAddress` options to method or set `defaultVaultAddress` in client options.

### How to use Testnet?

Set `isTestnet: true` in [transport](#transports) options.

## Contributing

We appreciate your help! To contribute, please read the [contributing instructions](CONTRIBUTING.md).
