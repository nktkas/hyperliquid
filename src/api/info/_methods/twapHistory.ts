import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { TwapStateSchema } from "./_base/commonSchemas.ts";

/**
 * Request twap history of a user.
 */
export const TwapHistoryRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("twapHistory"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request twap history of a user."),
  );
})();
export type TwapHistoryRequest = v.InferOutput<typeof TwapHistoryRequest>;

/**
 * Array of user's TWAP history.
 */
export const TwapHistoryResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Creation time of the history record (in seconds since epoch). */
        time: v.pipe(
          UnsignedInteger,
          v.description("Creation time of the history record (in seconds since epoch)."),
        ),
        /** State of the TWAP order. */
        state: v.pipe(
          TwapStateSchema,
          v.description("State of the TWAP order."),
        ),
        /**
         * Current status of the TWAP order.
         * - `"finished"`: Fully executed.
         * - `"activated"`: Active and executing.
         * - `"terminated"`: Terminated.
         * - `"error"`: An error occurred.
         */
        status: v.pipe(
          v.variant("status", [
            v.object({
              /** Status of the TWAP order. */
              status: v.pipe(
                v.picklist(["finished", "activated", "terminated"]),
                v.description("Status of the TWAP order."),
              ),
            }),
            v.object({
              /** Status of the TWAP order. */
              status: v.pipe(
                v.literal("error"),
                v.description("Status of the TWAP order."),
              ),
              /** Error message. */
              description: v.pipe(
                v.string(),
                v.description("Error message."),
              ),
            }),
          ]),
          v.description(
            "Current status of the TWAP order." +
              '\n- `"finished"`: Fully executed.' +
              '\n- `"activated"`: Active and executing.' +
              '\n- `"terminated"`: Terminated.' +
              '\n- `"error"`: An error occurred.',
          ),
        ),
        /** ID of the TWAP. */
        twapId: v.pipe(
          v.optional(UnsignedInteger),
          v.description("ID of the TWAP."),
        ),
      }),
    ),
    v.description("Array of user's TWAP history."),
  );
})();
export type TwapHistoryResponse = v.InferOutput<typeof TwapHistoryResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode twapHistory} function. */
export type TwapHistoryParameters = Omit<v.InferInput<typeof TwapHistoryRequest>, "type">;

/**
 * Request twap history of a user.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of user's TWAP history.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { twapHistory } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await twapHistory(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function twapHistory(
  config: InfoConfig,
  params: TwapHistoryParameters,
  signal?: AbortSignal,
): Promise<TwapHistoryResponse> {
  const request = v.parse(TwapHistoryRequest, {
    type: "twapHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
