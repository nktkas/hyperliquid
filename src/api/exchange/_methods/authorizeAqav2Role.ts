import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Authorize an AQAv2 role.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#authorize-aqav2-role
 */
export const AuthorizeAqav2RoleRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("authorizeAqav2Role"),
      /** Token identifier. */
      token: UnsignedInteger,
      /** Role to authorize. */
      role: v.picklist(["technical", "treasury"]),
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
export type AuthorizeAqav2RoleRequest = v.InferOutput<typeof AuthorizeAqav2RoleRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#authorize-aqav2-role
 */
export type AuthorizeAqav2RoleResponse =
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
const AuthorizeAqav2RoleActionSchema = /* @__PURE__ */ (() => {
  return v.object(AuthorizeAqav2RoleRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode authorizeAqav2Role} function. */
export type AuthorizeAqav2RoleParameters = Omit<v.InferInput<typeof AuthorizeAqav2RoleActionSchema>, "type">;

/** Request options for the {@linkcode authorizeAqav2Role} function. */
export type AuthorizeAqav2RoleOptions = ExtractRequestOptions<v.InferInput<typeof AuthorizeAqav2RoleRequest>>;

/** Successful variant of {@linkcode AuthorizeAqav2RoleResponse} without errors. */
export type AuthorizeAqav2RoleSuccessResponse = ExcludeErrorResponse<AuthorizeAqav2RoleResponse>;

/**
 * Authorize an AQAv2 role.
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
 * import { authorizeAqav2Role } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await authorizeAqav2Role({ transport, wallet }, {
 *   token: 0,
 *   role: "technical",
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#authorize-aqav2-role
 */
export function authorizeAqav2Role(
  config: ExchangeConfig,
  params: AuthorizeAqav2RoleParameters,
  opts?: AuthorizeAqav2RoleOptions,
): Promise<AuthorizeAqav2RoleSuccessResponse> {
  const action = canonicalize(
    AuthorizeAqav2RoleActionSchema,
    parse(AuthorizeAqav2RoleActionSchema, { type: "authorizeAqav2Role", ...params }),
  );
  return executeL1Action(config, action, opts);
}
