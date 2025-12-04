import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

/** Action related to validator management. */
export const CValidatorActionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.union([
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CValidatorAction"),
              v.description("Type of action."),
            ),
            /** Profile changes to apply. */
            changeProfile: v.pipe(
              v.object({
                /** Validator node IP address. */
                node_ip: v.pipe(
                  v.nullable(
                    v.object({
                      /** IP address. */
                      Ip: v.pipe(
                        v.string(),
                        v.ip(),
                        v.description("IP address."),
                      ),
                    }),
                  ),
                  v.description("Validator node IP address."),
                ),
                /** Validator name. */
                name: v.pipe(
                  v.nullable(v.string()),
                  v.description("Validator name."),
                ),
                /** Validator description. */
                description: v.pipe(
                  v.nullable(v.string()),
                  v.description("Validator description."),
                ),
                /** Validator jail status. */
                unjailed: v.pipe(
                  v.boolean(),
                  v.description("Validator jail status."),
                ),
                /** Enable or disable delegations. */
                disable_delegations: v.pipe(
                  v.nullable(v.boolean()),
                  v.description("Enable or disable delegations."),
                ),
                /** Commission rate in basis points (1 = 0.0001%). */
                commission_bps: v.pipe(
                  v.nullable(UnsignedInteger),
                  v.description("Commission rate in basis points (1 = 0.0001%)."),
                ),
                /** Signer address. */
                signer: v.pipe(
                  v.nullable(Address),
                  v.description("Signer address."),
                ),
              }),
              v.description("Profile changes to apply."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CValidatorAction"),
              v.description("Type of action."),
            ),
            /** Registration parameters. */
            register: v.pipe(
              v.object({
                /** Validator profile information. */
                profile: v.pipe(
                  v.object({
                    /** Validator node IP address. */
                    node_ip: v.pipe(
                      v.object({
                        /** IP address. */
                        Ip: v.pipe(
                          v.string(),
                          v.ip(),
                          v.description("IP address."),
                        ),
                      }),
                      v.description("Validator node IP address."),
                    ),
                    /** Validator name. */
                    name: v.pipe(
                      v.string(),
                      v.description("Validator name."),
                    ),
                    /** Validator description. */
                    description: v.pipe(
                      v.string(),
                      v.description("Validator description."),
                    ),
                    /** Whether delegations are disabled. */
                    delegations_disabled: v.pipe(
                      v.boolean(),
                      v.description("Whether delegations are disabled."),
                    ),
                    /** Commission rate in basis points (1 = 0.0001%). */
                    commission_bps: v.pipe(
                      UnsignedInteger,
                      v.description("Commission rate in basis points (1 = 0.0001%)."),
                    ),
                    /** Signer address. */
                    signer: v.pipe(
                      Address,
                      v.description("Signer address."),
                    ),
                  }),
                  v.description("Validator profile information."),
                ),
                /** Initial jail status. */
                unjailed: v.pipe(
                  v.boolean(),
                  v.description("Initial jail status."),
                ),
                /** Initial stake amount in wei. */
                initial_wei: v.pipe(
                  UnsignedInteger,
                  v.description("Initial stake amount in wei."),
                ),
              }),
              v.description("Registration parameters."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CValidatorAction"),
              v.description("Type of action."),
            ),
            /** Unregister the validator. */
            unregister: v.pipe(
              v.null(),
              v.description("Unregister the validator."),
            ),
          }),
        ]),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Action related to validator management."),
  );
})();
export type CValidatorActionRequest = v.InferOutput<typeof CValidatorActionRequest>;

/** Successful response without specific data or error response. */
export const CValidatorActionResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
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
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cValidatorAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * // Change validator profile
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
 *
 * // Register a new validator
 * await cValidatorAction(
 *   { transport, wallet },
 *   {
 *     register: {
 *       profile: {
 *         node_ip: { Ip: "1.2.3.4" },
 *         name: "...",
 *         description: "...",
 *         delegations_disabled: true,
 *         commission_bps: 1,
 *         signer: "0x...",
 *       },
 *       unjailed: false,
 *       initial_wei: 1,
 *     },
 *   },
 * );
 *
 * // Unregister a validator
 * await cValidatorAction(
 *   { transport, wallet },
 *   { unregister: null },
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
