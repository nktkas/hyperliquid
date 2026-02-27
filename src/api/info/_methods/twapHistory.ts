import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { TwapStateSchema } from "./_base/commonSchemas.ts";

/**
 * Request TWAP history of a user.
 * @see null
 */
export const TwapHistoryRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("twapHistory"),
    /** User address. */
    user: Address,
  });
})();
export type TwapHistoryRequest = v.InferOutput<typeof TwapHistoryRequest>;

/**
 * Array of user's TWAP history.
 * @see null
 */
export type TwapHistoryResponse = {
  /** Creation time of the history record (in seconds since epoch). */
  time: number;
  /** State of the TWAP order. */
  state: TwapStateSchema;
  /**
   * Current status of the TWAP order.
   * - `"finished"`: Fully executed.
   * - `"activated"`: Active and executing.
   * - `"terminated"`: Terminated.
   * - `"error"`: An error occurred.
   */
  status: {
    /** Status of the TWAP order. */
    status: "finished" | "activated" | "terminated";
  } | {
    /** Status of the TWAP order. */
    status: "error";
    /** Error message. */
    description: string;
  };
  /** ID of the TWAP. */
  twapId?: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode twapHistory} function. */
export type TwapHistoryParameters = Omit<v.InferInput<typeof TwapHistoryRequest>, "type">;

/**
 * Request TWAP history of a user.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of user's TWAP history.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function twapHistory(
  config: InfoConfig,
  params: TwapHistoryParameters,
  signal?: AbortSignal,
): Promise<TwapHistoryResponse> {
  const request = parse(TwapHistoryRequest, {
    type: "twapHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
