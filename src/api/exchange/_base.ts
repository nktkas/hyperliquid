import type { IRequestTransport } from "../../transport/base.ts";
import { Address, Hex, Integer, parser, type Prettify } from "../_base.ts";
import {
  type AbstractWallet,
  getWalletAddress,
  getWalletChainId,
  signL1Action,
  signMultiSigAction,
  signUserSignedAction,
} from "../../signing/mod.ts";
import { HyperliquidError } from "../../_base.ts";
import * as v from "valibot";

// -------------------- Types --------------------

export type MaybePromise<T> = T | Promise<T>;

/** Configuration for Exchange API requests. */
export interface ExchangeRequestConfig<
  T extends IRequestTransport = IRequestTransport,
  W extends AbstractWallet = AbstractWallet,
> {
  /** The transport used to connect to the Hyperliquid Exchange API. */
  transport: T;
  /** The wallet used to sign requests. */
  wallet: W;
  /**
   * The network that will be used to sign transactions.
   * Must match the network of the {@link wallet}.
   *
   * Defaults to get chain id from wallet otherwise `0x1`.
   */
  signatureChainId?: string | (() => MaybePromise<string>);
  /**
   * Function to get the next nonce for signing transactions.
   *
   * Defaults to a global nonce manager that uses the current timestamp in milliseconds,
   * and increments if the timestamp is not greater than the last nonce.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#hyperliquid-nonces
   */
  nonceManager?: () => MaybePromise<number>;
  /**
   * Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults
   */
  defaultVaultAddress?: string;
  /**
   * Sets a default expiresAfter to be used if no expiresAfter is explicitly passed to a method.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after
   */
  defaultExpiresAfter?: number | (() => MaybePromise<number>);
}

/** Configuration for Exchange API requests using multi-signature wallets. */
export interface MultiSignRequestConfig<
  T extends IRequestTransport = IRequestTransport,
  S extends readonly AbstractWallet[] = AbstractWallet[],
> extends Omit<ExchangeRequestConfig<T, S[0]>, "wallet"> {
  /** The multi-signature account address. */
  multiSigUser: string;
  /** Array of wallets used for multi-signature operations. The first wallet acts as the leader. */
  signers: S;
}

// deno-lint-ignore no-explicit-any
type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
export type ExtractRequestAction<T extends { action: Record<string, unknown> }> = Prettify<
  T["action"] extends { signatureChainId: unknown }
    ? DistributiveOmit<T["action"], "type" | "signatureChainId" | "hyperliquidChain" | "nonce" | "time"> // user-signed actions
    : DistributiveOmit<T["action"], "type"> // L1 actions
>;

export type ExtractRequestOptions<T extends { action: Record<string, unknown> }> = Prettify<
  & {
    /**
     * An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
     * If this option is set, the request can be canceled by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)
     * on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
     */
    signal?: AbortSignal;
  }
  & Omit<T, "action" | "nonce" | "signature">
>;

// -------------------- Schemas --------------------

/** ECDSA signature components for Ethereum typed data. */
export const Signature = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** First 32-byte component of ECDSA signature. */
      r: v.pipe(
        v.pipe(
          Hex,
          v.length(66),
          v.transform((value) => value.replace(/^0x0+/, "0x") as `0x${string}`),
        ),
        v.description("First 32-byte component of ECDSA signature."),
      ),
      /** Second 32-byte component of ECDSA signature. */
      s: v.pipe(
        v.pipe(
          Hex,
          v.length(66),
          v.transform((value) => value.replace(/^0x0+/, "0x") as `0x${string}`),
        ),
        v.description("Second 32-byte component of ECDSA signature."),
      ),
      /** Recovery identifier. */
      v: v.pipe(
        v.pipe(
          Integer,
          v.union([v.literal(27), v.literal(28)]),
        ),
        v.description("Recovery identifier."),
      ),
    }),
    v.description("ECDSA signature components for Ethereum typed data."),
  );
})();
export type Signature = v.InferOutput<typeof Signature>;

/** Error response for failed operations. */
export const ErrorResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Error status. */
      status: v.pipe(
        v.literal("err"),
        v.description("Error status."),
      ),
      /** Error message. */
      response: v.pipe(
        v.string(),
        v.description("Error message."),
      ),
    }),
    v.description("Error response for failed operations."),
  );
})();
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>;

/** Successful response without specific data. */
export const SuccessResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Successful status. */
      status: v.pipe(
        v.literal("ok"),
        v.description("Successful status."),
      ),
      /** Response details. */
      response: v.pipe(
        v.object({
          /** Type of response. */
          type: v.pipe(
            v.literal("default"),
            v.description("Type of response."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Successful response without specific data."),
  );
})();
export type SuccessResponse = v.InferOutput<typeof SuccessResponse>;

// -------------------- Functions: Other --------------------

import type { OrderResponse, OrderSuccessResponse } from "./order.ts";
import type { CancelResponse, CancelSuccessResponse } from "./cancel.ts";
import type { TwapOrderResponse, TwapOrderSuccessResponse } from "./twapOrder.ts";
import type { TwapCancelResponse, TwapCancelSuccessResponse } from "./twapCancel.ts";
import type { CreateSubAccountResponse } from "./createSubAccount.ts";
import type { CreateVaultResponse } from "./createVault.ts";

/** Thrown when an API request fails. */
export class ApiRequestError extends HyperliquidError {
  constructor(
    public response:
      | ErrorResponse
      | OrderResponse
      | CancelResponse
      | TwapOrderResponse
      | TwapCancelResponse,
  ) {
    let message;
    if (response.status === "err") {
      // ErrorResponse
      message = response.response;
    } else {
      if ("statuses" in response.response.data) {
        // OrderResponse | CancelResponse
        const errors = response.response.data.statuses.reduce<string[]>((acc, status, index) => {
          if (typeof status === "object" && "error" in status) {
            acc.push(`Order ${index}: ${status.error}`);
          }
          return acc;
        }, []);
        if (errors.length > 0) {
          message = errors.join(", ");
        }
      } else {
        // TwapOrderResponse | TwapCancelResponse
        if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
          message = response.response.data.status.error;
        }
      }
    }

    super(message || "An unknown error occurred while processing an API request. See `response` for more details.");
    this.name = "ApiRequestError";
  }
}

/**
 * Nonce manager for generating unique nonces for signing transactions.
 * Uses the current timestamp, and increments if the timestamp is not greater than the last nonce.
 */
class NonceManager {
  private lastNonce = 0;
  getNonce(): number {
    let nonce = Date.now();
    if (nonce <= this.lastNonce) {
      nonce = ++this.lastNonce;
    } else {
      this.lastNonce = nonce;
    }
    return nonce;
  }
}
const globalNonceManager = /* @__PURE__ */ new NonceManager();

/** Get the signature chain ID from the config value / function or from the wallet. */
export async function getSignatureChainId(
  config:
    | {
      wallet: AbstractWallet;
      signatureChainId?: string | (() => MaybePromise<string>);
    }
    | {
      signers: readonly AbstractWallet[];
      signatureChainId?: string | (() => MaybePromise<string>);
    },
): Promise<`0x${string}`> {
  if ("signatureChainId" in config && config.signatureChainId) {
    const signatureChainId = typeof config.signatureChainId === "string"
      ? config.signatureChainId
      : await config.signatureChainId();
    return parser(Hex)(signatureChainId);
  } else if ("wallet" in config) {
    return await getWalletChainId(config.wallet);
  } else {
    return await getWalletChainId(config.signers[0]);
  }
}

/** Get the nonce from the config function or from the global nonce manager. */
export async function getNonce(config?: { nonceManager?: () => MaybePromise<number> }): Promise<number> {
  return await config?.nonceManager?.() ?? globalNonceManager.getNonce();
}

type AnyResponse =
  | SuccessResponse
  | ErrorResponse
  | CancelResponse
  | CreateSubAccountResponse
  | CreateVaultResponse
  | OrderResponse
  | TwapOrderResponse
  | TwapCancelResponse;
type AnySuccessResponse =
  | SuccessResponse
  | CancelSuccessResponse
  | CreateSubAccountResponse
  | CreateVaultResponse
  | OrderSuccessResponse
  | TwapOrderSuccessResponse
  | TwapCancelSuccessResponse;

function validateResponse<T extends AnySuccessResponse>(response: AnyResponse): asserts response is T {
  if (response.status === "err") {
    throw new ApiRequestError(response as ErrorResponse);
  } else if (response.response.type === "order" || response.response.type === "cancel") {
    if (response.response.data.statuses.some((status) => typeof status === "object" && "error" in status)) {
      throw new ApiRequestError(response as OrderResponse | CancelResponse);
    }
  } else if (response.response.type === "twapOrder" || response.response.type === "twapCancel") {
    if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
      throw new ApiRequestError(response as TwapOrderResponse | TwapCancelResponse);
    }
  }
}

// -------------------- Functions: Signing --------------------

export async function executeL1Action<T extends AnySuccessResponse>(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  request: {
    action: Record<string, unknown>;
    vaultAddress?: string;
    expiresAfter?: number;
  },
  signal?: AbortSignal,
): Promise<T> {
  const { transport, nonceManager } = config;
  const { action, vaultAddress: vaultAddress_, expiresAfter } = request;

  const vaultAddress = vaultAddress_ ? parser(Address)(vaultAddress_) : undefined;
  const nonce = nonceManager ? await nonceManager() : globalNonceManager.getNonce();

  if ("signers" in config) {
    const { signers, multiSigUser: multiSigUser_ } = config;

    const multiSigUser = parser(Address)(multiSigUser_);
    const outerSigner = parser(Address)(await getWalletAddress(signers[0]));

    // Sign an L1 action for each signer
    let signatures = await Promise.all(signers.map(async (signer) => {
      return await signL1Action({
        wallet: signer,
        action: [multiSigUser, outerSigner, action],
        nonce,
        isTestnet: transport.isTestnet,
        vaultAddress,
        expiresAfter,
      });
    }));
    signatures = parser(v.array(Signature))(signatures); // ensure correct format

    // Send a request via multi-sign action
    return await executeMultiSigAction(
      { ...config, wallet: signers[0] },
      {
        action: {
          type: "multiSig",
          signatureChainId: await getSignatureChainId(config),
          signatures,
          payload: { multiSigUser, outerSigner, action },
        },
        vaultAddress,
        expiresAfter,
        nonce,
      },
      signal,
    );
  } else {
    const { wallet } = config;

    // Sign an L1 action
    const signature = await signL1Action({
      wallet,
      action,
      nonce,
      isTestnet: transport.isTestnet,
      vaultAddress,
      expiresAfter,
    });

    // Send a request
    const response = await transport.request(
      "exchange",
      { action, signature, nonce, vaultAddress, expiresAfter },
      signal,
    ) as
      | SuccessResponse
      | ErrorResponse
      | CancelResponse
      | CreateSubAccountResponse
      | CreateVaultResponse
      | OrderResponse
      | TwapOrderResponse
      | TwapCancelResponse;
    validateResponse<T>(response);
    return response;
  }
}

export async function executeUserSignedAction<T extends AnySuccessResponse>(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  request: {
    action:
      & {
        signatureChainId: `0x${string}`;
        [key: string]: unknown;
      }
      & (
        | { nonce: number; time?: undefined }
        | { time: number; nonce?: undefined }
      );
    types: {
      [key: string]: {
        name: string;
        type: string;
      }[];
    };
  },
  signal?: AbortSignal,
): Promise<T> {
  const { transport } = config;
  const { action, types } = request;

  const nonce = action.nonce ?? action.time;

  if ("signers" in config) {
    const { signers, multiSigUser: multiSigUser_ } = config;

    const multiSigUser = parser(Address)(multiSigUser_);
    const outerSigner = parser(Address)(await getWalletAddress(signers[0]));

    // Sign a user-signed action for each signer
    let signatures = await Promise.all(signers.map(async (signer) => {
      return await signUserSignedAction({
        wallet: signer,
        action: {
          payloadMultiSigUser: multiSigUser,
          outerSigner,
          ...action,
        },
        types,
      });
    }));
    signatures = parser(v.array(Signature))(signatures); // ensure correct format

    // Send a request via multi-sign action
    return await executeMultiSigAction(
      { ...config, wallet: signers[0] },
      {
        action: {
          type: "multiSig",
          signatureChainId: action.signatureChainId,
          signatures,
          payload: { multiSigUser, outerSigner, action },
        },
        nonce,
      },
      signal,
    );
  } else {
    const { wallet } = config;

    // Sign a user-signed action
    const signature = await signUserSignedAction({ wallet, action, types });

    // Send a request
    const response = await transport.request(
      "exchange",
      { action, signature, nonce },
      signal,
    ) as
      | SuccessResponse
      | ErrorResponse
      | CancelResponse
      | CreateSubAccountResponse
      | CreateVaultResponse
      | OrderResponse
      | TwapOrderResponse
      | TwapCancelResponse;
    validateResponse<T>(response);
    return response;
  }
}

export async function executeMultiSigAction<T extends AnySuccessResponse>(
  config: ExchangeRequestConfig,
  request: {
    action: {
      signatureChainId: `0x${string}`;
      [key: string]: unknown;
    };
    nonce: number;
    vaultAddress?: string;
    expiresAfter?: number;
  },
  signal?: AbortSignal,
): Promise<T> {
  const { transport, wallet } = config;
  const { action, nonce, vaultAddress: vaultAddress_, expiresAfter } = request;

  const vaultAddress = vaultAddress_ ? parser(Address)(vaultAddress_) : undefined;

  // Sign a multi-signature action
  const signature = await signMultiSigAction({
    wallet,
    action,
    nonce,
    isTestnet: transport.isTestnet,
    vaultAddress,
    expiresAfter,
  });

  // Send a request
  const response = await transport.request(
    "exchange",
    { action, signature, nonce, vaultAddress, expiresAfter },
    signal,
  ) as
    | SuccessResponse
    | ErrorResponse
    | CancelResponse
    | CreateSubAccountResponse
    | CreateVaultResponse
    | OrderResponse
    | TwapOrderResponse
    | TwapCancelResponse;
  validateResponse<T>(response);
  return response;
}
