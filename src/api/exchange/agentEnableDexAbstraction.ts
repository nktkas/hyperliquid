import * as v from "valibot";
import { parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base/mod.ts";

// -------------------- Schemas --------------------

/**
 * Enable HIP-3 DEX abstraction.
 * @see null
 */
export const AgentEnableDexAbstractionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("agentEnableDexAbstraction"),
            v.description("Type of action."),
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
    v.description("Enable HIP-3 DEX abstraction request."),
  );
})();
export type AgentEnableDexAbstractionRequest = v.InferOutput<typeof AgentEnableDexAbstractionRequest>;

import { SuccessResponse } from "./_base/mod.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Request options for the {@linkcode agentEnableDexAbstraction} function. */
export type AgentEnableDexAbstractionOptions = ExtractRequestOptions<
  v.InferInput<typeof AgentEnableDexAbstractionRequest>
>;

/**
 * Enable HIP-3 DEX abstraction.
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
 * import { agentEnableDexAbstraction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await agentEnableDexAbstraction({ transport, wallet });
 * ```
 */
export async function agentEnableDexAbstraction(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  opts?: AgentEnableDexAbstractionOptions,
): Promise<SuccessResponse> {
  const request = parser(AgentEnableDexAbstractionRequest)({
    action: {
      type: "agentEnableDexAbstraction",
    },
    nonce: 0, // Placeholder; actual nonce generated in `executeL1Action`
    signature: { // Placeholder; actual signature generated in `executeL1Action`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
    expiresAfter: typeof config.defaultExpiresAfter === "number"
      ? config.defaultExpiresAfter
      : await config.defaultExpiresAfter?.(),
  });
  return await executeL1Action(config, request, opts?.signal);
}
