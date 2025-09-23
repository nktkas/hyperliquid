import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Create a vault.
 * @see null
 */
export const CreateVaultRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("createVault"),
            v.description("Type of action."),
          ),
          /** Vault name. */
          name: v.pipe(
            v.string(),
            v.minLength(3),
            v.description("Vault name."),
          ),
          /** Vault description. */
          description: v.pipe(
            v.string(),
            v.minLength(10),
            v.description("Vault description."),
          ),
          /** Initial balance (float * 1e6). */
          initialUsd: v.pipe(
            UnsignedInteger,
            v.minValue(100000000), // 100 USDC
            v.description("Initial balance (float * 1e6)."),
          ),
          /** Unique request identifier (current timestamp in ms) (default: Date.now()). */
          nonce: v.pipe(
            v.optional(UnsignedInteger, () => Date.now()), // default value is allowed because this is an L1 action
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
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Create a vault."),
  );
})();
export type CreateVaultRequest = v.InferOutput<typeof CreateVaultRequest>;

/** Response for creating a vault. */
export const CreateVaultResponse = /* @__PURE__ */ (() => {
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
            v.literal("createVault"),
            v.description("Type of response."),
          ),
          /** Vault address. */
          data: v.pipe(
            Address,
            v.description("Vault address."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Response for creating a vault."),
  );
})();
export type CreateVaultResponse = v.InferOutput<typeof CreateVaultResponse>;

// -------------------- Function --------------------

/** Action parameters for the {@linkcode createVault} function. */
export type CreateVaultParameters = ExtractRequestAction<v.InferInput<typeof CreateVaultRequest>>;
/** Request options for the {@linkcode createVault} function. */
export type CreateVaultOptions = ExtractRequestOptions<v.InferInput<typeof CreateVaultRequest>>;

/**
 * Create a vault.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Response for creating a vault.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { createVault } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await createVault(
 *   { transport, wallet },
 *   {
 *     name: "...",
 *     description: "...",
 *     initialUsd: 100 * 1e6,
 *   },
 * );
 * ```
 */
export async function createVault(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CreateVaultParameters>,
  opts?: CreateVaultOptions,
): Promise<CreateVaultResponse> {
  const action = parser(CreateVaultRequest.entries.action)({
    type: "createVault",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
