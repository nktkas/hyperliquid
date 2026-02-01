import * as v from "@valibot/valibot";
import { Hex } from "../../../_schemas.ts";

/** Error response for failed operations. */
export const ErrorResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Error status. */
    status: v.literal("err"),
    /** Error message. */
    response: v.string(),
  });
})();
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>;

/** Successful response without specific data. */
export const SuccessResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Successful status. */
    status: v.literal("ok"),
    /** Response details. */
    response: v.object({
      /** Type of response. */
      type: v.literal("default"),
    }),
  });
})();
export type SuccessResponse = v.InferOutput<typeof SuccessResponse>;

/** ECDSA signature components. */
export const SignatureSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** First 32-byte component. */
    r: v.pipe(Hex, v.length(66)),
    /** Second 32-byte component. */
    s: v.pipe(Hex, v.length(66)),
    /** Recovery identifier. */
    v: v.picklist([27, 28]),
  });
})();
export type SignatureSchema = v.InferOutput<typeof SignatureSchema>;

/** HyperLiquid network type. */
export const HyperliquidChainSchema = /* @__PURE__ */ (() => {
  return v.picklist(["Mainnet", "Testnet"]);
})();
export type HyperliquidChainSchema = v.InferOutput<typeof HyperliquidChainSchema>;
