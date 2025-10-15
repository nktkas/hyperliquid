import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Action related to validator management.
 * @see null
 */
export const CValidatorActionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.variant("type", [
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

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode CValidatorAction} function. */
export type CValidatorActionParameters = ExtractRequestAction<v.InferInput<typeof CValidatorActionRequest>>;
/** Request options for the {@linkcode CValidatorAction} function. */
export type CValidatorActionOptions = ExtractRequestOptions<v.InferInput<typeof CValidatorActionRequest>>;

/**
 * Action related to validator management.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
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
export async function cValidatorAction(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CValidatorActionParameters>,
  opts?: CValidatorActionOptions,
): Promise<SuccessResponse> {
  const action = parser(CValidatorActionRequest.entries.action)({
    type: "CValidatorAction",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
