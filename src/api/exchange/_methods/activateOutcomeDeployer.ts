import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Activate or deactivate the signer as an outcome deployer.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-4-deployer-actions#activation
 */
export const ActivateOutcomeDeployerRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("activateOutcomeDeployer"),
      /** Deactivate instead of activate. */
      isDeactivate: v.boolean(),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type ActivateOutcomeDeployerRequest = v.InferOutput<typeof ActivateOutcomeDeployerRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-4-deployer-actions#activation
 */
export type ActivateOutcomeDeployerResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import { canonicalize } from "../../../signing/mod.ts";
import {
  type ExchangeConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestOptions,
} from "./_base/mod.ts";

/** Schema for action fields (excludes request-level system fields). */
const ActivateOutcomeDeployerActionSchema = /* @__PURE__ */ (() => {
  return v.object(ActivateOutcomeDeployerRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode activateOutcomeDeployer} function. */
export type ActivateOutcomeDeployerParameters = Omit<
  v.InferInput<typeof ActivateOutcomeDeployerActionSchema>,
  "type"
>;

/** Request options for the {@linkcode activateOutcomeDeployer} function. */
export type ActivateOutcomeDeployerOptions = ExtractRequestOptions<
  v.InferInput<typeof ActivateOutcomeDeployerRequest>
>;

/** Successful variant of {@linkcode ActivateOutcomeDeployerResponse} without errors. */
export type ActivateOutcomeDeployerSuccessResponse = ExcludeErrorResponse<ActivateOutcomeDeployerResponse>;

/**
 * Activate or deactivate the signer as an outcome deployer.
 *
 * Signing: L1 Action.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { activateOutcomeDeployer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await activateOutcomeDeployer({ transport, wallet }, {
 *   isDeactivate: false,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-4-deployer-actions#activation
 */
export function activateOutcomeDeployer(
  config: ExchangeConfig,
  params: ActivateOutcomeDeployerParameters,
  opts?: ActivateOutcomeDeployerOptions,
): Promise<ActivateOutcomeDeployerSuccessResponse> {
  const action = canonicalize(
    ActivateOutcomeDeployerActionSchema,
    parse(ActivateOutcomeDeployerActionSchema, { type: "activateOutcomeDeployer", ...params }),
  );
  return executeL1Action(config, action, opts);
}
