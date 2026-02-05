import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/** Action related to validator management. */
export const CValidatorActionRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Validator management action. */
    action: v.variant("type", [
      v.object({
        /** Type of action. */
        type: v.literal("CValidatorAction"),
        /** Profile changes to apply. */
        changeProfile: v.object({
          /** Validator node IP address. */
          node_ip: v.nullable(
            v.object({
              /** IP address. */
              Ip: v.pipe(v.string(), v.ip()),
            }),
          ),
          /** Validator name. */
          name: v.nullable(v.string()),
          /** Validator description. */
          description: v.nullable(v.string()),
          /** Whether the validator is unjailed. */
          unjailed: v.boolean(),
          /** Enable or disable delegations. */
          disable_delegations: v.nullable(v.boolean()),
          /** Commission rate in basis points (1 = 0.0001%). */
          commission_bps: v.nullable(UnsignedInteger),
          /** Signer address. */
          signer: v.nullable(Address),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("CValidatorAction"),
        /** Registration parameters. */
        register: v.object({
          /** Validator profile information. */
          profile: v.object({
            /** Validator node IP address. */
            node_ip: v.object({
              /** IP address. */
              Ip: v.pipe(v.string(), v.ip()),
            }),
            /** Validator name. */
            name: v.string(),
            /** Validator description. */
            description: v.string(),
            /** Whether delegations are disabled. */
            delegations_disabled: v.boolean(),
            /** Commission rate in basis points (1 = 0.0001%). */
            commission_bps: UnsignedInteger,
            /** Signer address. */
            signer: Address,
          }),
          /** Initial jail status. */
          unjailed: v.boolean(),
          /** Initial stake amount in wei. */
          initial_wei: UnsignedInteger,
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("CValidatorAction"),
        /** Unregister the validator. */
        unregister: v.null(),
      }),
    ]),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type CValidatorActionRequest = v.InferOutput<typeof CValidatorActionRequest>;

/** Successful response without specific data or error response. */
export const CValidatorActionResponse = /* @__PURE__ */ (() => {
  return v.union([SuccessResponse, ErrorResponse]);
})();
export type CValidatorActionResponse = v.InferOutput<typeof CValidatorActionResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CValidatorActionParameters = /* @__PURE__ */ (() => {
  return v.union(
    CValidatorActionRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  );
})();
/** Action parameters for the {@linkcode cValidatorAction} function. */
export type CValidatorActionParameters = v.InferInput<typeof CValidatorActionParameters>;

/** Request options for the {@linkcode cValidatorAction} function. */
export type CValidatorActionOptions = ExtractRequestOptions<v.InferInput<typeof CValidatorActionRequest>>;

/** Successful variant of {@linkcode CValidatorActionResponse} without errors. */
export type CValidatorActionSuccessResponse = ExcludeErrorResponse<CValidatorActionResponse>;

/**
 * Action related to validator management.
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
 * @example Change validator profile
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cValidatorAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cValidatorAction(
 *   { transport, wallet },
 *   {
 *     changeProfile: {
 *       node_ip: { Ip: "1.2.3.4" },
 *       name: "...",
 *       description: "...",
 *       unjailed: true,
 *       disable_delegations: false,
 *       commission_bps: null,
 *       signer: null,
 *     },
 *   },
 * );
 * ```
 */
export function cValidatorAction(
  config: ExchangeConfig,
  params: CValidatorActionParameters,
  opts?: CValidatorActionOptions,
): Promise<CValidatorActionSuccessResponse> {
  const action = v.parse(CValidatorActionParameters, params);
  return executeL1Action(config, { type: "CValidatorAction", ...action }, opts);
}
