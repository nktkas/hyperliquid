import * as v from "@valibot/valibot";
import { Hex, UnsignedInteger } from "../../../_schemas.ts";

/** Error response for failed operations. */
export const ErrorResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Error status. */
      status: v.pipe(
        v.literal("err"),
        v.description("Error status."),
      ),
      /** Error message. */
      response: v.pipe(
        v.string(),
        v.description("Error message."),
      ),
    }),
    v.description("Error response for failed operations."),
  );
})();
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>;

/** Successful response without specific data. */
export const SuccessResponse = /* @__PURE__ */ (() => {
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
            v.literal("default"),
            v.description("Type of response."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Successful response without specific data."),
  );
})();
export type SuccessResponse = v.InferOutput<typeof SuccessResponse>;

/** ECDSA signature components. */
export const Signature = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** First 32-byte component. */
      r: v.pipe(
        v.pipe(Hex, v.length(66)),
        v.description("First 32-byte component."),
      ),
      /** Second 32-byte component. */
      s: v.pipe(
        v.pipe(Hex, v.length(66)),
        v.description("Second 32-byte component."),
      ),
      /** Recovery identifier. */
      v: v.pipe(
        v.picklist([27, 28]),
        v.description("Recovery identifier."),
      ),
    }),
    v.description("ECDSA signature components."),
  );
})();
export type Signature = v.InferOutput<typeof Signature>;

/** Nonce (timestamp in ms) used to prevent replay attacks. */
export const Nonce = /* @__PURE__ */ (() => {
  return v.pipe(
    UnsignedInteger,
    v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
  );
})();
export type Nonce = v.InferOutput<typeof Nonce>;

/** Chain ID in hex format for EIP-712 signing. */
export const SignatureChainId = /* @__PURE__ */ (() => {
  return v.pipe(
    Hex,
    v.description("Chain ID in hex format for EIP-712 signing."),
  );
})();
export type SignatureChainId = v.InferOutput<typeof SignatureChainId>;

/** HyperLiquid network type. */
export const HyperliquidChain = /* @__PURE__ */ (() => {
  return v.pipe(
    v.picklist(["Mainnet", "Testnet"]),
    v.description("HyperLiquid network type."),
  );
})();
export type HyperliquidChain = v.InferOutput<typeof HyperliquidChain>;
