import * as v from "valibot";
import { Hex } from "../../_base.ts";

/** ECDSA signature components for Ethereum typed data. */
export const Signature = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** First 32-byte component of ECDSA signature. */
      r: v.pipe(
        v.pipe(Hex, v.length(66)),
        v.description("First 32-byte component of ECDSA signature."),
      ),
      /** Second 32-byte component of ECDSA signature. */
      s: v.pipe(
        v.pipe(Hex, v.length(66)),
        v.description("Second 32-byte component of ECDSA signature."),
      ),
      /** Recovery identifier. */
      v: v.pipe(
        v.union([v.literal(27), v.literal(28)]),
        v.description("Recovery identifier."),
      ),
    }),
    v.description("ECDSA signature components for Ethereum typed data."),
  );
})();
export type Signature = v.InferOutput<typeof Signature>;

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
