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
 * Create a sub-account.
 * @see null
 */
export const CreateSubAccountRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("createSubAccount"),
            v.description("Type of action."),
          ),
          /** Sub-account name. */
          name: v.pipe(
            v.string(),
            v.minLength(1),
            v.description("Sub-account name."),
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
    v.description("Create a sub-account."),
  );
})();
export type CreateSubAccountRequest = v.InferOutput<typeof CreateSubAccountRequest>;

/** Response for creating a sub-account. */
export const CreateSubAccountResponse = /* @__PURE__ */ (() => {
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
            v.literal("createSubAccount"),
            v.description("Type of response."),
          ),
          /** Sub-account address. */
          data: v.pipe(
            Address,
            v.description("Sub-account address."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Response for creating a sub-account."),
  );
})();
export type CreateSubAccountResponse = v.InferOutput<typeof CreateSubAccountResponse>;

// -------------------- Function --------------------

/** Action parameters for the {@linkcode createSubAccount} function. */
export type CreateSubAccountParameters = ExtractRequestAction<v.InferInput<typeof CreateSubAccountRequest>>;
/** Request options for the {@linkcode createSubAccount} function. */
export type CreateSubAccountOptions = ExtractRequestOptions<v.InferInput<typeof CreateSubAccountRequest>>;

/**
 * Create a sub-account.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Response for creating a sub-account.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { createSubAccount } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await createSubAccount(
 *   { transport, wallet },
 *   { name: "..." },
 * );
 * ```
 */
export async function createSubAccount(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CreateSubAccountParameters>,
  opts?: CreateSubAccountOptions,
): Promise<CreateSubAccountResponse> {
  const action = parser(CreateSubAccountRequest.entries.action)({
    type: "createSubAccount",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
