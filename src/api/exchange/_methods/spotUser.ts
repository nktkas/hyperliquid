import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Opt Out of Spot Dusting.
 * @see null
 */
export const SpotUserRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("spotUser"),
      /** Spot dusting options. */
      toggleSpotDusting: v.object({
        /** Opt out of spot dusting. */
        optOut: v.boolean(),
      }),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type SpotUserRequest = v.InferOutput<typeof SpotUserRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type SpotUserResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SpotUserParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SpotUserRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode spotUser} function. */
export type SpotUserParameters = v.InferInput<typeof SpotUserParameters>;

/** Request options for the {@linkcode spotUser} function. */
export type SpotUserOptions = ExtractRequestOptions<v.InferInput<typeof SpotUserRequest>>;

/** Successful variant of {@linkcode SpotUserResponse} without errors. */
export type SpotUserSuccessResponse = ExcludeErrorResponse<SpotUserResponse>;

/**
 * Opt Out of Spot Dusting.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotUser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await spotUser(
 *   { transport, wallet },
 *   { toggleSpotDusting: { optOut: false } },
 * );
 * ```
 *
 * @see null
 */
export function spotUser(
  config: ExchangeConfig,
  params: SpotUserParameters,
  opts?: SpotUserOptions,
): Promise<SpotUserSuccessResponse> {
  const action = v.parse(SpotUserParameters, params);
  return executeL1Action(config, { type: "spotUser", ...action }, opts);
}
