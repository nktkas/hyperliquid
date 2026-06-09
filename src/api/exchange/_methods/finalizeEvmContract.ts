import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Finalize the link between a HyperCore spot token and an ERC-20 contract on the HyperEVM.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/hypercore-less-than-greater-than-hyperevm-transfers
 */
export const FinalizeEvmContractRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("finalizeEvmContract"),
      /** Token identifier to link. */
      token: UnsignedInteger,
      /**
       * Verification method matching how the EVM contract was deployed:
       * - `{ create: { nonce } }`: contract deployed from an EOA — the EVM user signs with the deploy nonce.
       * - `"firstStorageSlot"`: finalizer address is stored at the contract's first storage slot.
       * - `"customStorageSlot"`: finalizer address is stored at slot `keccak256("HyperCore deployer")`.
       */
      input: v.union([
        v.object({
          /** Use the EVM deployment nonce of an EOA-deployed contract. */
          create: v.object({
            /** Nonce used to deploy the EVM contract. */
            nonce: UnsignedInteger,
          }),
        }),
        v.literal("firstStorageSlot"),
        v.literal("customStorageSlot"),
      ]),
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
export type FinalizeEvmContractRequest = v.InferOutput<typeof FinalizeEvmContractRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/hypercore-less-than-greater-than-hyperevm-transfers
 */
export type FinalizeEvmContractResponse =
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
const FinalizeEvmContractActionSchema = /* @__PURE__ */ (() => {
  return v.object(FinalizeEvmContractRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode finalizeEvmContract} function. */
export type FinalizeEvmContractParameters = Omit<v.InferInput<typeof FinalizeEvmContractActionSchema>, "type">;

/** Request options for the {@linkcode finalizeEvmContract} function. */
export type FinalizeEvmContractOptions = ExtractRequestOptions<v.InferInput<typeof FinalizeEvmContractRequest>>;

/** Successful variant of {@linkcode FinalizeEvmContractResponse} without errors. */
export type FinalizeEvmContractSuccessResponse = ExcludeErrorResponse<FinalizeEvmContractResponse>;

/**
 * Finalize the link between a HyperCore spot token and an ERC-20 contract on the HyperEVM.
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
 * @example Finalize from an EOA-deployed contract
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { finalizeEvmContract } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await finalizeEvmContract({ transport, wallet }, {
 *   token: 200,
 *   input: { create: { nonce: 0 } },
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/hypercore-less-than-greater-than-hyperevm-transfers
 */
export function finalizeEvmContract(
  config: ExchangeConfig,
  params: FinalizeEvmContractParameters,
  opts?: FinalizeEvmContractOptions,
): Promise<FinalizeEvmContractSuccessResponse> {
  const action = canonicalize(
    FinalizeEvmContractActionSchema,
    parse(FinalizeEvmContractActionSchema, { type: "finalizeEvmContract", ...params }),
  );
  return executeL1Action(config, action, opts);
}
