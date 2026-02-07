import * as v from "@valibot/valibot";
import { Hex } from "../../../_schemas.ts";

/** Error response for failed operations. */
export type ErrorResponse = {
  /** Error status. */
  status: "err";
  /** Error message. */
  response: string;
};

/** Successful response without specific data. */
export type SuccessResponse = {
  /** Successful status. */
  status: "ok";
  /** Response details. */
  response: {
    /** Type of response. */
    type: "default";
  };
};

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
