import type { IRequestTransport } from "../../../transport/base.ts";
import type { AbstractWallet } from "../../../signing/_signTypedData.ts";
import type { MaybePromise, Prettify } from "../../_base.ts";

import type { CancelResponse, CancelSuccessResponse } from "../cancel.ts";
import type { CreateSubAccountResponse } from "../createSubAccount.ts";
import type { CreateVaultResponse } from "../createVault.ts";
import type { OrderResponse, OrderSuccessResponse } from "../order.ts";
import type { TwapCancelResponse, TwapCancelSuccessResponse } from "../twapCancel.ts";
import type { TwapOrderResponse, TwapOrderSuccessResponse } from "../twapOrder.ts";
import type { ErrorResponse, SuccessResponse } from "./_schemas.ts";

export type AnyResponse =
  | SuccessResponse
  | ErrorResponse
  | CancelResponse
  | CreateSubAccountResponse
  | CreateVaultResponse
  | OrderResponse
  | TwapOrderResponse
  | TwapCancelResponse;
export type AnySuccessResponse =
  | SuccessResponse
  | CancelSuccessResponse
  | CreateSubAccountResponse
  | CreateVaultResponse
  | OrderSuccessResponse
  | TwapOrderSuccessResponse
  | TwapCancelSuccessResponse;

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
   * Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults
   */
  defaultVaultAddress?: string;
  /**
   * Sets a default expiresAfter to be used if no expiresAfter is explicitly passed to a method.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after
   */
  defaultExpiresAfter?: number | (() => MaybePromise<number>);
  /**
   * A fixed nonce or a function that returns a nonce to be used for signing requests.
   *
   * Defaults to a global nonce manager that uses the current timestamp in milliseconds,
   * and increments if the timestamp is not greater than the last nonce.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#hyperliquid-nonces
   */
  nonceManager?: number | ((address: string) => MaybePromise<number>);
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

export type ExcludeErrorResponse<T> = T extends { status: "err" } ? never // Response with error status
  : T extends { response: { data: { statuses: ReadonlyArray<infer S> } } } // Responses with multiple statuses
    ? Exclude<S, { error: unknown }> extends never ? never
    : Prettify<
      Omit<T, "response"> & {
        response: Prettify<Omit<T["response"], "data"> & { data: { statuses: Array<Exclude<S, { error: unknown }>> } }>;
      }
    >
  : T extends { response: { data: { status: infer S } } } // Responses with single status
    ? S extends { error: unknown } ? never
    : Prettify<
      Omit<T, "response"> & {
        response: Prettify<Omit<T["response"], "data"> & { data: { status: Exclude<S, { error: unknown }> } }>;
      }
    >
  : T;
