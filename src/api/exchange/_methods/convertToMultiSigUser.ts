import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/** Signers configuration for {@linkcode ConvertToMultiSigUserRequest}. */
const ConvertToMultiSigUserRequestSigners = /* @__PURE__ */ (() => {
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
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: SignatureChainId,
          /** HyperLiquid network type. */
          hyperliquidChain: HyperliquidChain,
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
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: Nonce,
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
    }),
    v.description("Convert a single-signature account to a multi-signature account or vice versa."),
  );
})();
export type ConvertToMultiSigUserRequest = v.InferOutput<typeof ConvertToMultiSigUserRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export const ConvertToMultiSigUserResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ConvertToMultiSigUserResponse = v.InferOutput<typeof ConvertToMultiSigUserResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const ConvertToMultiSigUserParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(ConvertToMultiSigUserRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode convertToMultiSigUser} function. */
export type ConvertToMultiSigUserParameters = v.InferInput<typeof ConvertToMultiSigUserParameters>;

/** Request options for the {@linkcode convertToMultiSigUser} function. */
export type ConvertToMultiSigUserOptions = ExtractRequestOptions<v.InferInput<typeof ConvertToMultiSigUserRequest>>;

/** Successful variant of {@linkcode ConvertToMultiSigUserResponse} without errors. */
export type ConvertToMultiSigUserSuccessResponse = ExcludeErrorResponse<ConvertToMultiSigUserResponse>;

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
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export function convertToMultiSigUser(
  config: ExchangeConfig,
  params: ConvertToMultiSigUserParameters,
  opts?: ConvertToMultiSigUserOptions,
): Promise<ConvertToMultiSigUserSuccessResponse> {
  const action = v.parse(ConvertToMultiSigUserParameters, params);
  return executeUserSignedAction(
    config,
    { type: "convertToMultiSigUser", ...action },
    ConvertToMultiSigUserTypes,
    opts,
  );
}
