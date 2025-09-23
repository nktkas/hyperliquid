import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeUserSignedAction,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  getNonce,
  getSignatureChainId,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/** Signers configuration for {@linkcode ConvertToMultiSigUserRequest}. */
export const ConvertToMultiSigUserRequestSigners = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      v.object({
        /** List of authorized user addresses. */
        authorizedUsers: v.pipe(
          v.array(Address),
          v.description("List of authorized user addresses."),
        ),
        /** Minimum number of signatures required. */
        threshold: v.pipe(
          UnsignedInteger,
          v.description("Minimum number of signatures required."),
        ),
      }),
      /** Convert a multi-signature account to a single-signature account. */
      v.pipe(
        v.null(),
        v.description("Convert a multi-signature account to a single-signature account."),
      ),
    ]),
    v.description("Signers configuration for `ConvertToMultiSigUserRequest`"),
  );
})();
export type ConvertToMultiSigUserRequestSigners = v.InferOutput<typeof ConvertToMultiSigUserRequestSigners>;

/**
 * Convert a single-signature account to a multi-signature account or vice versa.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export const ConvertToMultiSigUserRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("convertToMultiSigUser"),
            v.description("Type of action."),
          ),
          /** Chain ID used for signing. */
          signatureChainId: v.pipe(
            Hex,
            v.description("Chain ID used for signing."),
          ),
          /** HyperLiquid network. */
          hyperliquidChain: v.pipe(
            v.union([v.literal("Mainnet"), v.literal("Testnet")]),
            v.description("HyperLiquid network."),
          ),
          /**
           * Signers configuration.
           *
           * Must be {@linkcode ConvertToMultiSigUserRequestSigners} converted to a string via `JSON.stringify(...)`.
           */
          signers: v.pipe(
            v.union([
              v.pipe(
                v.string(),
                v.parseJson(),
                ConvertToMultiSigUserRequestSigners,
                v.stringifyJson(),
              ),
              v.pipe(
                ConvertToMultiSigUserRequestSigners,
                v.stringifyJson(),
              ),
            ]),
            v.description(
              "Signers configuration." +
                "\n\nMust be `ConvertToMultiSigUserRequestSigners` converted to a string via `JSON.stringify(...)`.",
            ),
          ),
          /** Unique request identifier (current timestamp in ms). */
          nonce: v.pipe(
            UnsignedInteger,
            v.description("Unique request identifier (current timestamp in ms)."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
    }),
    v.description("Convert a single-signature account to a multi-signature account or vice versa."),
  );
})();
export type ConvertToMultiSigUserRequest = v.InferOutput<typeof ConvertToMultiSigUserRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode convertToMultiSigUser} function. */
export type ConvertToMultiSigUserParameters = ExtractRequestAction<v.InferInput<typeof ConvertToMultiSigUserRequest>>;
/** Request options for the {@linkcode convertToMultiSigUser} function. */
export type ConvertToMultiSigUserOptions = ExtractRequestOptions<v.InferInput<typeof ConvertToMultiSigUserRequest>>;

/** EIP-712 types for the {@linkcode convertToMultiSigUser} function. */
export const ConvertToMultiSigUserTypes = {
  "HyperliquidTransaction:ConvertToMultiSigUser": [
    { name: "hyperliquidChain", type: "string" },
    { name: "signers", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Convert a single-signature account to a multi-signature account or vice versa.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { convertToMultiSigUser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * // Convert to multi-sig user
 * await convertToMultiSigUser(
 *   { transport, wallet },
 *   {
 *     signers: {
 *       authorizedUsers: ["0x...", "0x...", "0x..."],
 *       threshold: 2,
 *     },
 *   },
 * );
 *
 * // Convert to single-sig user
 * await convertToMultiSigUser(
 *   { transport, wallet },
 *   { signers: null },
 * );
 * ```
 */
export async function convertToMultiSigUser(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<ConvertToMultiSigUserParameters>,
  opts?: ConvertToMultiSigUserOptions,
): Promise<SuccessResponse> {
  const action = parser(ConvertToMultiSigUserRequest.entries.action)({
    type: "convertToMultiSigUser",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: ConvertToMultiSigUserTypes },
    opts?.signal,
  );
}
